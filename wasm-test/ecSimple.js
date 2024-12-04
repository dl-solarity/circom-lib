const { assert, log } = require("console");
const path = require("path");

const Scalar = require("ffjavascript").Scalar;
const wasm_tester = require("circom_tester").wasm;

function bigintToArray(n, k, x) {
    let mod = BigInt(1);
    for (let idx = 0; idx < n; idx++) {
        mod *= BigInt(2);
    }

    const ret = [];
    let xTemp = x;
    for (let idx = 0; idx < k; idx++) {
        ret.push(xTemp % mod);
        xTemp /= mod; 
    }

    return ret;
}

function modInverse(a, m) {
    a = BigInt(a);
    m = BigInt(m);
  
    let m0 = m;
    let x0 = BigInt(0);
    let x1 = BigInt(1);
  
    if (m === 1n) return 0n;
  
    while (a > 1n) {
        let q = a / m;
        let t = m;

        m = a % m;
        a = t;
        t = x0;

        x0 = x1 - q * x0;
        x1 = t;
    }

    if (x1 < 0n) {
        x1 += m0;
    }

    return x1;
}

function point_double(x1, y1, a, p) {
    x1 = BigInt(x1);
    y1 = BigInt(y1);
    a = BigInt(a);
    p = BigInt(p);

    if (y1 === 0n) {
        return { x: null, y: null }; 
    }

    let lambda_num = (3n * x1 * x1 + a) % p;
    let lambda_den = modInverse(2n * y1, p);
    let lam = (lambda_num * lambda_den) % p;

    let x3 = (lam * lam - 2n * x1) % p;
    let y3 = (lam * (x1 - x3) - y1) % p;

    if (x3 < 0n) x3 += p;
    if (y3 < 0n) y3 += p;

    return { x: x3, y: y3 };
}

function point_add(x1, y1, x2, y2, p) {
    x1 = BigInt(x1);
    y1 = BigInt(y1);
    x2 = BigInt(x2);
    y2 = BigInt(y2);
    p = BigInt(p);

    if (x1 === x2 && y1 === y2) {
        throw new Error("Points are the same; use point_double instead.");
    }

    if (x1 === x2) {
        return { x: null, y: null };
    }
    let lambda_num = (p + y2 - y1) % p;
    let lambda_den = modInverse((p + x2 - x1) % p, p);
    let lam = (lambda_num * lambda_den) % p;

    let x3 = (2n * p + lam * lam - x1 - x2) % p;
    let y3 = (p + lam * (x1 - x3) - y1) % p;

    if (x3 < 0n) x3 += p;
    if (y3 < 0n) y3 += p;

    return { x: x3, y: y3 };
}

function onCurveCheck(x1, y1, a, b, p){
    return y1*y1 % p == (x1 * x1 * x1 + a * x1 + b) % p
}

async function testOnCurve(input1, input2, circuit){
    let input = [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)];


    let real_result = onCurveCheck(input1, input2, 0n, 7n, 115792089237316195423570985008687907853269984665640564039457584007908834671663n);

    try {
        const w = await circuit.calculateWitness({ in: input, dummy: 0n }, true);

        if (!real_result) {
            throw new Error(`Expected failure for P(${input1}, ${input2}) not on curve, but it passed.`);
        }
    } catch (err) {
        if (real_result) {
            throw new Error(`Unexpected failure for P(${input1}, ${input2}) on curve.`);
        } else {
            console.log(`Predicted failure for P(${input1}, ${input2}) not on curve correctly handled.`);
        }
    }
}

async function testDouble(input1, input2, circuit){
    let input = [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)];


    let doubled = point_double(input1, input2, 0n, 115792089237316195423570985008687907853269984665640564039457584007908834671663n)

    let real_result = bigintToArray(64, 4, doubled.x).concat(bigintToArray(64, 4, doubled.y));

    const w = await circuit.calculateWitness({in: input, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+8);

    for (var i = 0; i < 8; i++){
        assert(circuit_result[i] == real_result[i], `double(${input1}; ${input2})`);
    }
}

async function testDoubleBrainpoolP256r1(input1, input2, circuit){
    let input = [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)];


    let doubled = point_double(input1, input2, 56698187605326110043627228396178346077120614539475214109386828188763884139993n, 76884956397045344220809746629001649093037950200943055203735601445031516197751n)

    let real_result = bigintToArray(64, 4, doubled.x).concat(bigintToArray(64, 4, doubled.y));

    const w = await circuit.calculateWitness({in: input, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+8);

    for (var i = 0; i < 8; i++){
        assert(circuit_result[i] == real_result[i], `BrainpoolP256r1 double(${input1}; ${input2})`);
    }
}

async function testAdd(input1, input2, input3, input4, circuit){

    let added = point_add(input1, input2, input3, input4, 115792089237316195423570985008687907853269984665640564039457584007908834671663n)

    let real_result = bigintToArray(64, 4, added.x).concat(bigintToArray(64, 4, added.y));

    const w = await circuit.calculateWitness({in1: [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)], in2: [bigintToArray(64, 4, input3), bigintToArray(64, 4, input4)], dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+8);

    for (var i = 0; i < 8; i++){
        assert(circuit_result[i] == real_result[i], `add(${input1}; ${input2}) + (${input3}, ${input4})`);
    }
}

async function testAddBrainpoolP256r1(input1, input2, input3, input4, circuit){
    let input = [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)];

    let added = point_add(input1, input2, input3, input4, 76884956397045344220809746629001649093037950200943055203735601445031516197751n)

    let real_result = bigintToArray(64, 4, added.x).concat(bigintToArray(64, 4, added.y));

    const w = await circuit.calculateWitness({in1: [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)], in2: [bigintToArray(64, 4, input3), bigintToArray(64, 4, input4)], dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+8);

    for (var i = 0; i < 8; i++){
        assert(circuit_result[i] == real_result[i], `BrainpoolP256r1 double(${input1}; ${input2})`);
    }
}

describe("Secp256r1 Add test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "ec", "add.circom"));
    });

    it("G + 2 * G", async function () {
        await testAdd(55066263022277343669578718895168534326250603453777594175500187360389116729240n, 32670510020758816978083085130507043184471273380659243275938904335757337482424n, 89565891926547004231252920425935692360644145829622209833684329913297188986597n, 12158399299693830322967808612713398636155367887041628176798871954788371653930n, circuit);
    });

    it("P(112711660439710606056748659173929673102114977341539408544630613555209775888121, 25583027980570883691656905877401976406448868254816295069919888960541586679410) + P(89565891926547004231252920425935692360644145829622209833684329913297188986597, 12158399299693830322967808612713398636155367887041628176798871954788371653930)", async function () {
        await testAdd(112711660439710606056748659173929673102114977341539408544630613555209775888121n, 25583027980570883691656905877401976406448868254816295069919888960541586679410n, 89565891926547004231252920425935692360644145829622209833684329913297188986597n, 12158399299693830322967808612713398636155367887041628176798871954788371653930n, circuit);
    });
});

describe("Brainpool Add test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "ec", "addBrainpoolP256r1.circom"));
    });

    it("G + 2 * G", async function () {
        await testAddBrainpoolP256r1(63243729749562333355292243550312970334778175571054726587095381623627144114786n, 38218615093753523893122277964030810387585405539772602581557831887485717997975n, 52575969560191351534542091466380106041028581718640875237441073011616025668110n, 24843789797109572893402439557748964186754677981311543350228155441542769376468n, circuit);
    });
});

describe("Secp256r1 Double test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "ec", "double.circom"));
    });

    it("Secp256r1 G * 2", async function () {
        await testDouble(55066263022277343669578718895168534326250603453777594175500187360389116729240n, 32670510020758816978083085130507043184471273380659243275938904335757337482424n, circuit);
    });

    it("P(89565891926547004231252920425935692360644145829622209833684329913297188986597,12158399299693830322967808612713398636155367887041628176798871954788371653930) * 2", async function () {
        await testDouble(89565891926547004231252920425935692360644145829622209833684329913297188986597n, 12158399299693830322967808612713398636155367887041628176798871954788371653930n, circuit);
    });

});

describe("Brainpool Double test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "ec", "doubleBrainpoolP256r1.circom"));
    });

    it("Brainpool G * 2", async function () {
        await testDoubleBrainpoolP256r1(63243729749562333355292243550312970334778175571054726587095381623627144114786n, 38218615093753523893122277964030810387585405539772602581557831887485717997975n, circuit);
    });

});

describe("Secp256r1 On Curve test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "ec", "onCurve.circom"));
    });

    it("G on curve", async function () {
        await testOnCurve(55066263022277343669578718895168534326250603453777594175500187360389116729240n, 32670510020758816978083085130507043184471273380659243275938904335757337482424n, circuit);
    });

    it("P(89565891926547004231252920425935692360644145829622209833684329913297188986597,12158399299693830322967808612713398636155367887041628176798871954788371653930) on curve", async function () {
        await testOnCurve(89565891926547004231252920425935692360644145829622209833684329913297188986597n, 12158399299693830322967808612713398636155367887041628176798871954788371653930n, circuit);
    });

    it("P(89565891926547004231252920425935692360644145829622209833684329913297188986597 + 1,12158399299693830322967808612713398636155367887041628176798871954788371653930 + 1) on curve, should catch error", async function () {
        await testOnCurve(89565891926547004231252920425935692360644145829622209833684329913297188986598n, 12158399299693830322967808612713398636155367887041628176798871954788371653931n, circuit);
    });
});

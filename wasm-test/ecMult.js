const { assert, log } = require("console");
const path = require("path");
const fs = require('fs');
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

function point_scalar_mul(x, y, k, a, p) {
    let x_res = null;
    let y_res = null;

    let x_cur = x;
    let y_cur = y;

    while (k > 0n) {
        if (k & 1n) {
            if (x_res === null && y_res === null) {
                x_res = x_cur;
                y_res = y_cur;
            } else {
                const { x: x_temp, y: y_temp } = point_add(x_res, y_res, x_cur, y_cur, p);
                x_res = x_temp;
                y_res = y_temp;
            }
        }

        const { x: x_temp, y: y_temp } = point_double(x_cur, y_cur, a, p);
        x_cur = x_temp;
        y_cur = y_temp;

        k >>= 1n; // Shift k right by 1 bit
    }

    return { x: x_res, y: y_res };
}

async function testScalarMult(input1, input2, input3, circuit){
    let input = [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)];

    let mult = point_scalar_mul(input1, input2, input3, 0n, 115792089237316195423570985008687907853269984665640564039457584007908834671663n)

    let real_result = bigintToArray(64, 4, mult.x).concat(bigintToArray(64, 4, mult.y));

    const w = await circuit.calculateWitness({in: input, scalar: bigintToArray(64, 4, input3), dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+8);

    for (var i = 0; i < 8; i++){
        assert(circuit_result[i] == real_result[i], `${input3} * (${input1}; ${input2})`);
    }
}

async function testScalarMultBrainpoolP256r1(input1, input2, input3, circuit){
    let input = [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)];

    let mult = point_scalar_mul(input1, input2, input3, 56698187605326110043627228396178346077120614539475214109386828188763884139993n, 76884956397045344220809746629001649093037950200943055203735601445031516197751n)

    let real_result = bigintToArray(64, 4, mult.x).concat(bigintToArray(64, 4, mult.y));

    const w = await circuit.calculateWitness({in: input, scalar: bigintToArray(64, 4, input3), dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+8);

    for (var i = 0; i < 8; i++){
        assert(circuit_result[i] == real_result[i], `${input3} * (${input1}; ${input2})`);
    }
}

async function testGenMult(input1, circuit){

    let mult = point_scalar_mul(55066263022277343669578718895168534326250603453777594175500187360389116729240n, 32670510020758816978083085130507043184471273380659243275938904335757337482424n, input1, 0n, 115792089237316195423570985008687907853269984665640564039457584007908834671663n)

    let real_result = bigintToArray(64, 4, mult.x).concat(bigintToArray(64, 4, mult.y));

    const w = await circuit.calculateWitness({scalar: bigintToArray(64, 4, input1), dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+8);

    for (var i = 0; i < 8; i++){
        assert(circuit_result[i] == real_result[i], `${input1} * G`);
    }
}

async function testGenMultBrainpoolP256r1(input1, circuit){

    let mult = point_scalar_mul(63243729749562333355292243550312970334778175571054726587095381623627144114786n, 38218615093753523893122277964030810387585405539772602581557831887485717997975n, input1, 56698187605326110043627228396178346077120614539475214109386828188763884139993n, 76884956397045344220809746629001649093037950200943055203735601445031516197751n)

    let real_result = bigintToArray(64, 4, mult.x).concat(bigintToArray(64, 4, mult.y));

    const w = await circuit.calculateWitness({scalar: bigintToArray(64, 4, input1), dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+8);

    for (var i = 0; i < 8; i++){
        assert(circuit_result[i] == real_result[i], `${input1} * G:\n ${circuit_result[i]} ${real_result[i]}`);
    }
}

async function testPrecomputeMult(input1, input2, input3,circuit){
    const P = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;
    const A = 0n;
    const B = 7n;

    let json = path.join(__dirname, `./precompute.json`);
    const data = await fs.promises.readFile(json, 'utf8');
    const input = JSON.parse(data);

    let mult = point_scalar_mul(input1, input2, input3, 0n, 115792089237316195423570985008687907853269984665640564039457584007908834671663n)

    let real_result = bigintToArray(64, 4, mult.x).concat(bigintToArray(64, 4, mult.y));

    const w = await circuit.calculateWitness({scalar: bigintToArray(64, 4, input3), in: [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)], dummy: 0n, powers: input.powers}, true);

    let circuit_result = w.slice(1, 1+8);

    for (var i = 0; i < 8; i++){
        assert(circuit_result[i] == real_result[i], `${real_result[i]} ${circuit_result[i]}`);
    }
}

async function testPrecomputeMultBrainpoolP256r1(input1, input2, input3,circuit){
    let json = path.join(__dirname, `./precomputeBrainpool.json`);
    const data = await fs.promises.readFile(json, 'utf8');
    const input = JSON.parse(data);

    let mult = point_scalar_mul(input1, input2, input3, 56698187605326110043627228396178346077120614539475214109386828188763884139993n, 76884956397045344220809746629001649093037950200943055203735601445031516197751n)

    let real_result = bigintToArray(64, 4, mult.x).concat(bigintToArray(64, 4, mult.y));

    const w = await circuit.calculateWitness({scalar: bigintToArray(64, 4, input3), in: [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)], dummy: 0n, powers: input.powers}, true);

    let circuit_result = w.slice(1, 1+8);

    for (var i = 0; i < 8; i++){
        assert(circuit_result[i] == real_result[i], `${real_result[i]} ${circuit_result[i]}`);
    }
}

describe("Secp256k1 generator multiplication test", function () {

    this.timeout(10000000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "ec", "generatorMult.circom"));
    });

    it("2 * G", async function () {
        await testGenMult(2n, circuit);
    });

    it("115792089237316195417293883273301227131288926373708328631619254798622859984896 * G", async function () {
        await testGenMult(115792089237316195417293883273301227131288926373708328631619254798622859984896n, circuit);
    });

});

describe("BrainpoolP256r1 generator multiplication test", function () {

    this.timeout(10000000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "ec", "generatorMultBrainpoolP256r1.circom"));
    });

    it("2 * G", async function () {
        await testGenMultBrainpoolP256r1(2n, circuit);
    });

    it("115792089237316195417293883273301227131288926373708328631619254798622859984896 * G", async function () {
        await testGenMultBrainpoolP256r1(115792089237316195417293883273301227131288926373708328631619254798622859984896n, circuit);
    });

});

describe("Scalar point multiplication test", function () {

    this.timeout(10000000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "ec", "scalarMult.circom"));
    });

    it("2 * (55066263022277343669578718895168534326250603453777594175500187360389116729240; 32670510020758816978083085130507043184471273380659243275938904335757337482424)", async function () {
        await testScalarMult(2n, 55066263022277343669578718895168534326250603453777594175500187360389116729240n, 32670510020758816978083085130507043184471273380659243275938904335757337482424n, circuit);
    });

    it("115792089237316195417293883273301227131288926373708328631619254798622859984896 * (89565891926547004231252920425935692360644145829622209833684329913297188986597;12158399299693830322967808612713398636155367887041628176798871954788371653930)", async function () {
        await testScalarMult(89565891926547004231252920425935692360644145829622209833684329913297188986597n, 12158399299693830322967808612713398636155367887041628176798871954788371653930n,115792089237316195417293883273301227131288926373708328631619254798622859984896n, circuit);
    });

});

describe("BrainpoolP256r1 scalar point multiplication test", function () {

    this.timeout(10000000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "ec", "scalarMultBrainpoolP256r1.circom"));
    });

    it("115792089237316195417293883273301227131288926373708328631619254798622859984896 * (52575969560191351534542091466380106041028581718640875237441073011616025668110;24843789797109572893402439557748964186754677981311543350228155441542769376468)", async function () {
        await testScalarMultBrainpoolP256r1(52575969560191351534542091466380106041028581718640875237441073011616025668110n, 24843789797109572893402439557748964186754677981311543350228155441542769376468n,115792089237316195417293883273301227131288926373708328631619254798622859984896n, circuit);
    });

});

// If u want change this tests, put correct table at precompute.json
describe("Precompute scalar point multiplication test", function () {

    this.timeout(10000000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "ec", "precomputeMult.circom"));
    });

    it("4 * (55066263022277343669578718895168534326250603453777594175500187360389116729240; 32670510020758816978083085130507043184471273380659243275938904335757337482424)", async function () {
        await testPrecomputeMult(55066263022277343669578718895168534326250603453777594175500187360389116729240n, 32670510020758816978083085130507043184471273380659243275938904335757337482424n, 4n, circuit);
    });

});

// If u want change this tests, put correct table at precompute2.json
describe("Precompute scalar point multiplication test BrainpoolP256r1", function () {

    this.timeout(10000000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "ec", "precomputeMultBrainpoolP256r1.circom"));
    });

    it("115792089237316195417293883273301227131288926373708328631619254798622859984896n * (52575969560191351534542091466380106041028581718640875237441073011616025668110n; 24843789797109572893402439557748964186754677981311543350228155441542769376468n)", async function () {
        await testPrecomputeMultBrainpoolP256r1(52575969560191351534542091466380106041028581718640875237441073011616025668110n, 24843789797109572893402439557748964186754677981311543350228155441542769376468n,115792089237316195417293883273301227131288926373708328631619254798622859984896n, circuit);
    });

});

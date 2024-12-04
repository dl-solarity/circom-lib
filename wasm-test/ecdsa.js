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

function bit_arr_to_num(arr){
    res = 0n
    for (var i = 0; i < arr.length; i++){
        res += BigInt(arr[i]) * 2n ** (BigInt(arr.length) - 1n - BigInt(i))
    }
    return res
}

async function testVerNum(input1, input2, input3, input4, input5, circuit){
    let input = [[bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)], [bigintToArray(64, 4, input3), bigintToArray(64, 4, input4)], bigintToArray(64, 4, input5)];

    let n = 76884956397045344220809746629001649092737531784414529538755519063063536359079n

    let sinv = modInverse(input4, n)
    let sh = sinv * input5 % n
    let sr = sinv * input3 % n
    let p1 = point_scalar_mul(input1, input2, sr, 56698187605326110043627228396178346077120614539475214109386828188763884139993n, 76884956397045344220809746629001649093037950200943055203735601445031516197751n)
    let p2 = point_scalar_mul(63243729749562333355292243550312970334778175571054726587095381623627144114786n, 38218615093753523893122277964030810387585405539772602581557831887485717997975n, sh, 56698187605326110043627228396178346077120614539475214109386828188763884139993n, 76884956397045344220809746629001649093037950200943055203735601445031516197751n)

    let p3 = point_add(p1.x, p1.y, p2.x, p2.y, 76884956397045344220809746629001649093037950200943055203735601445031516197751n) 

    let real_result = (p3.x == input3)

    try {
        const w = await circuit.calculateWitness({ pubkey: input[0], signature: input[1], hashed: input[2], dummy: 0n }, true);

        if (!real_result) {
            throw new Error(`Expected failure for verification (${input1}, ${input2}), (${input3}, ${input4}) ${input5}, but it passed.`);
        }
    } catch (err) {
        if (real_result) {
            throw new Error(`Unexpected failure for verification (${input1}, ${input2}), (${input3}, ${input4}) ${input5}.`);
        } else {
            console.log(`Predicted failure for verification (${input1}, ${input2}), (${input3}, ${input4}) ${input5} correctly handled.`);
        }
    }
}

async function testVerBits(input1, input2, input3, input4, input5, circuit){
    let input = [[bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)], [bigintToArray(64, 4, input3), bigintToArray(64, 4, input4)], input5];

    let n = 76884956397045344220809746629001649092737531784414529538755519063063536359079n
    let hn = BigInt(bit_arr_to_num(input5))
    let sinv = modInverse(input4, n)
    let sh = sinv * hn % n
    let sr = sinv * input3 % n
    let p1 = point_scalar_mul(input1, input2, sr, 56698187605326110043627228396178346077120614539475214109386828188763884139993n, 76884956397045344220809746629001649093037950200943055203735601445031516197751n)
    let p2 = point_scalar_mul(63243729749562333355292243550312970334778175571054726587095381623627144114786n, 38218615093753523893122277964030810387585405539772602581557831887485717997975n, sh, 56698187605326110043627228396178346077120614539475214109386828188763884139993n, 76884956397045344220809746629001649093037950200943055203735601445031516197751n)

    let p3 = point_add(p1.x, p1.y, p2.x, p2.y, 76884956397045344220809746629001649093037950200943055203735601445031516197751n) 

    let real_result = (p3.x == input3)

    try {
        const w = await circuit.calculateWitness({ pubkey: input[0], signature: input[1], hashed: input[2], dummy: 0n }, true);

        if (!real_result) {
            throw new Error(`Expected failure for verification (${input1}, ${input2}), (${input3}, ${input4}) ${input5}, but it passed.`);
        }
    } catch (err) {
        if (real_result) {
            throw new Error(`Unexpected failure for verification (${input1}, ${input2}), (${input3}, ${input4}) ${input5}.`);
        } else {
            console.log(`Predicted failure for verification (${input1}, ${input2}), (${input3}, ${input4}) ${input5} not on curve correctly handled.`);
        }
    }
}

describe("Ecdsa num test", function () {

    this.timeout(10000000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "signatures", "ecdsaNum.circom"));
    });

    it("Ver correct signature", async function () {
        await testVerNum(31374990377422060663897166666788812921270243020104798068084951911347116539007n, 41157152733927076370846415947227885284998856909034587685323725392788996793783n, 41785691604214669431201278410214784582546070760560366208613932232380633581249n, 45015635295556179986733632766516885633143292479837071894657301025399130399180n, 53877815096637157910110176920073475792177340572623780182175655462294595163782n, circuit);
    });

    it("Ver incorrect signature, should handle failture", async function () {
        await testVerNum(31374990377422060663897166666788812921270243020104798068084951911347116539007n, 41157152733927076370846415947227885284998856909034587685323725392788996793783n, 41785691604214669431201278410214784582546070760560366208613932232380633581249n, 45015635295556179986733632766516885633143292479837071894657301025399130399180n, 53877815096637157910110176920073475792177340572623780182175655462294595163783n, circuit);
    });
});

describe("Ecdsa bits test", function () {

    this.timeout(10000000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "signatures", "ecdsaBits.circom"));
    });

    it("Ver correct signature", async function () {
        await testVerBits(31374990377422060663897166666788812921270243020104798068084951911347116539007n, 41157152733927076370846415947227885284998856909034587685323725392788996793783n, 41785691604214669431201278410214784582546070760560366208613932232380633581249n, 45015635295556179986733632766516885633143292479837071894657301025399130399180n, [0n,1n,1n,1n,0n,1n,1n,1n,0n,0n,0n,1n,1n,1n,0n,1n,1n,1n,0n,0n,0n,0n,1n,1n,0n,0n,1n,1n,1n,1n,1n,1n,0n,1n,1n,0n,1n,0n,1n,1n,1n,0n,1n,0n,0n,0n,1n,1n,0n,1n,0n,1n,1n,1n,0n,1n,1n,1n,0n,1n,1n,1n,0n,1n,1n,1n,1n,1n,0n,0n,1n,1n,1n,0n,1n,0n,0n,0n,0n,1n,0n,0n,0n,1n,0n,1n,1n,0n,0n,0n,0n,1n,0n,0n,1n,1n,1n,0n,0n,1n,0n,1n,0n,0n,0n,0n,0n,0n,1n,0n,1n,0n,0n,0n,1n,0n,1n,0n,1n,0n,1n,1n,0n,1n,1n,1n,0n,1n,0n,0n,0n,0n,0n,0n,1n,1n,1n,0n,0n,0n,1n,0n,1n,1n,1n,1n,1n,1n,1n,0n,1n,0n,1n,0n,0n,0n,1n,0n,0n,1n,1n,1n,0n,0n,1n,0n,1n,0n,0n,1n,0n,0n,0n,1n,1n,1n,1n,1n,1n,1n,0n,0n,1n,1n,1n,0n,1n,0n,0n,1n,1n,1n,0n,0n,0n,1n,0n,1n,1n,1n,0n,0n,1n,1n,0n,1n,1n,0n,0n,1n,0n,1n,0n,1n,0n,1n,1n,1n,1n,1n,0n,1n,0n,1n,1n,1n,0n,0n,1n,0n,0n,0n,0n,0n,0n,1n,1n,1n,0n,1n,1n,1n,0n,1n,0n,1n,1n,0n,1n,0n,0n,0n,0n,1n,1n,0n], circuit);
    });

    it("Ver incorrect signature, should handle failture", async function () {
        await testVerBits(31374990377422060663897166666788812921270243020104798068084951911347116539007n, 41157152733927076370846415947227885284998856909034587685323725392788996793783n, 41785691604214669431201278410214784582546070760560366208613932232380633581249n, 45015635295556179986733632766516885633143292479837071894657301025399130399180n, [0n,1n,1n,1n,0n,1n,1n,1n,0n,0n,0n,1n,1n,1n,0n,1n,1n,1n,0n,0n,0n,0n,1n,1n,0n,0n,1n,1n,1n,1n,1n,1n,0n,1n,1n,0n,1n,0n,1n,1n,1n,0n,1n,0n,0n,0n,1n,1n,0n,1n,0n,1n,1n,1n,0n,1n,1n,1n,0n,1n,1n,1n,0n,1n,1n,1n,1n,1n,0n,0n,1n,1n,1n,0n,1n,0n,0n,0n,0n,1n,0n,0n,0n,1n,0n,1n,1n,0n,0n,0n,0n,1n,0n,0n,1n,1n,1n,0n,0n,1n,0n,1n,0n,0n,0n,0n,0n,0n,1n,0n,1n,0n,0n,0n,1n,0n,1n,0n,1n,0n,1n,1n,0n,1n,1n,1n,0n,1n,0n,0n,0n,0n,0n,0n,1n,1n,1n,0n,0n,0n,1n,0n,1n,1n,1n,1n,1n,1n,1n,0n,1n,0n,1n,0n,0n,0n,1n,0n,0n,1n,1n,1n,0n,0n,1n,0n,1n,0n,0n,1n,0n,0n,0n,1n,1n,1n,1n,1n,1n,1n,0n,0n,1n,1n,1n,0n,1n,0n,0n,1n,1n,1n,0n,0n,0n,1n,0n,1n,1n,1n,0n,0n,1n,1n,0n,1n,1n,0n,0n,1n,0n,1n,0n,1n,0n,1n,1n,1n,1n,1n,0n,1n,0n,1n,1n,1n,0n,0n,1n,0n,0n,0n,0n,0n,0n,1n,1n,1n,0n,1n,1n,1n,0n,1n,0n,1n,1n,0n,1n,0n,0n,0n,0n,1n,1n,1n], circuit);
    });
});

const { assert } = require("console");
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

async function testInv(input1, input2, circuit){
    let input = [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)];

    let real_result = bigintToArray(64, 4, modInverse(input1, input2));

    const w = await circuit.calculateWitness({in: input[0], modulus: input[1], dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+4);

    for (var i = 0; i < 4; i++){
        assert(circuit_result[i] == real_result[i], `1 / ${input1} % ${input2}: ${circuit_result[i]}, ${real_result[i]}`);
    }

}


describe("Big Inv test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bigInt", "bigInv.circom"));
    });


    it("1 / 109730872847609188478309451572148122150330802072000585050763249942403213063436 % 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn", async function () {
        await testInv(109730872847609188478309451572148122150330802072000585050763249942403213063436n, 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn, circuit);
    });

});

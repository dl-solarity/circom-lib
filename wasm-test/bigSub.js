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

async function testSub(input1, input2, circuit){
    let input = [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)];

    let real_result = bigintToArray(64, 4, input1 - input2);

    const w = await circuit.calculateWitness({in: input, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+4);

    for (var i = 0; i < 4; i++){
        assert(circuit_result[i] == real_result[i], `${input1} - ${input2}: ${circuit_result[i]}, ${real_result[i]}`);
    }

}

describe("Big sub test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bigInt", "bigSub.circom"));
    });

    it("15 - 15", async function () {
        await testSub(15n, 15n, circuit);
    });

    it("16 - 15", async function () {
        await testSub(16n, 15n, circuit);
    });

    it("6277101735386680763835789423207666416102355444464034512896 - 6277101735386680763835789423207666416102355444464034512895", async function () {
        await testSub(6277101735386680763835789423207666416102355444464034512896n, 6277101735386680763835789423207666416102355444464034512895n, circuit);
    });
    it("115792089237316195423570985008687907853269984665640564039457584007913129639935 - 109730872847609188478309451572148122150330802072000585050763249942403213063436", async function () {
        await testSub(115792089237316195423570985008687907853269984665640564039457584007913129639935n, 109730872847609188478309451572148122150330802072000585050763249942403213063436n, circuit);
    });

});

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

async function testAdding(input1, input2, circuit){
    let input = [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)];

    let real_result = bigintToArray(64, 5, input1 + input2);

    const w = await circuit.calculateWitness({in: input, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+5);

    for (var i = 0; i < 5; i++){
        assert(circuit_result[i] == real_result[i])
    }

}
async function testAddingNonEqual(input1, input2, circuit){
    let input = [bigintToArray(64, 6, input1), bigintToArray(64, 4, input2)];

    let real_result = bigintToArray(64, 7, input1 + input2);

    const w = await circuit.calculateWitness({in1: input[0], in2: input[1], dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+7);

    for (var i = 0; i < 7; i++){
        assert(circuit_result[i] == real_result[i])
    }

}

describe("Big add test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bigInt", "bigAdd.circom"));
    });

    //no overflows
    it("15 + 15", async function () {
        await testAdding(15n, 15n, circuit);
    });

    //last overflow
    it("109730872847609188478309451572148122150330802072000585050763249942403213063436 + 109730872847609188478309451572148122150330802072000585050763249942403213063436", async function () {
        await testAdding(109730872847609188478309451572148122150330802072000585050763249942403213063436n, 109730872847609188478309451572148122150330802072000585050763249942403213063436n, circuit);
    });

    //all overflows
    it("ff...ff (256 bit) + ff...ff (256 bit)", async function () {
        await testAdding(115792089237316195423570985008687907853269984665640564039457584007913129639935n, 115792089237316195423570985008687907853269984665640564039457584007913129639935n, circuit);
    });

});

describe("Big add test (Non Equal)", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bigInt", "bigAddNonEqual.circom"));
    });

    //no overflows
    it("15 + 15", async function () {
        await testAddingNonEqual(15n, 15n, circuit);
    });

    it("24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933 + 109730872847609188478309451572148122150330802072000585050763249942403213063436", async function () {
        await testAddingNonEqual(24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933n, 109730872847609188478309451572148122150330802072000585050763249942403213063436n, circuit);
    });

    it("24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933 + ff...ff (256 bit)", async function () {
        await testAddingNonEqual(24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933n, 115792089237316195423570985008687907853269984665640564039457584007913129639935n, circuit);
    });

});
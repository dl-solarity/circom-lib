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

async function testIsEqual(input1, input2, circuit){
    let input = [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)];

    let real_result = 1n;

    if (input1 != input2){
        real_result = 0n;
    }

    const w = await circuit.calculateWitness({in: input}, true);

    let circuit_result = w[1];
    assert(circuit_result == real_result, `${input1} == ${input2}`);
}

async function testLessThan(input1, input2, circuit){
    let input = [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)];

    let real_result = 1n;

    if (input1 >= input2){
        real_result = 0n;
    }

    const w = await circuit.calculateWitness({in: input}, true);

    let circuit_result = w[1];
    assert(circuit_result == real_result, `${input1} < ${input2}`);
}

async function testLessEqThan(input1, input2, circuit){
    let input = [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)];

    let real_result = 1n;

    if (input1 > input2){
        real_result = 0n;
    }

    const w = await circuit.calculateWitness({in: input}, true);

    let circuit_result = w[1];
    assert(circuit_result == real_result, `${input1} <= ${input2}`);
}

async function testGreaterThan(input1, input2, circuit){
    let input = [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)];

    let real_result = 1n;

    if (input1 <= input2){
        real_result = 0n;
    }

    const w = await circuit.calculateWitness({in: input}, true);

    let circuit_result = w[1];
    assert(circuit_result == real_result, `${input1} > ${input2}`);
}

async function testGreaterEqThan(input1, input2, circuit){
    let input = [bigintToArray(64, 4, input1), bigintToArray(64, 4, input2)];

    let real_result = 1n;

    if (input1 < input2){
        real_result = 0n;
    }

    const w = await circuit.calculateWitness({in: input}, true);

    let circuit_result = w[1];
    assert(circuit_result == real_result, `${input1} >= ${input2}`);
}

describe("Comparators tests", function () {

    this.timeout(100000);
    let circuitEqual;
    let circuitLessThan;
    let circuitLessEqThan;
    let circuitGreaterThan;
    let circuitGreaterEqThan;

    before(async () => {
        circuitEqual = await wasm_tester(path.join(__dirname, "circuits", "bigInt", "bigIsEqual.circom"));
        circuitLessThan = await wasm_tester(path.join(__dirname, "circuits", "bigInt", "bigLessThan.circom"));
        circuitLessEqThan = await wasm_tester(path.join(__dirname, "circuits", "bigInt", "bigLessEqThan.circom"));
        circuitGreaterThan = await wasm_tester(path.join(__dirname, "circuits", "bigInt", "bigGreaterThan.circom"));
        circuitGreaterEqThan = await wasm_tester(path.join(__dirname, "circuits", "bigInt", "bigGreaterEqThan.circom"));
    });

    it("15 === 15", async function () {
        await testIsEqual(15n, 15n, circuitEqual);
    });

    it("15 === 16", async function () {
        await testIsEqual(15n, 16n, circuitEqual);
    });

    it("109730872847609188478309451572148122150330802072000585050763249942403213063436 === 109730872847609188478309451572148122150330802072000585050763249942403213063436", async function () {
        await testIsEqual(109730872847609188478309451572148122150330802072000585050763249942403213063436n, 109730872847609188478309451572148122150330802072000585050763249942403213063436n, circuitEqual);
    });

    it("15 === 109730872847609188478309451572148122150330802072000585050763249942403213063436", async function () {
        await testIsEqual(15n, 109730872847609188478309451572148122150330802072000585050763249942403213063436n, circuitEqual);
    });

    it("ff...ff (256 bit) === ff...ff (256 bit)", async function () {
        await testIsEqual(115792089237316195423570985008687907853269984665640564039457584007913129639935n, 115792089237316195423570985008687907853269984665640564039457584007913129639935n, circuitEqual);
    });

    it("15 < 15", async function () {
        await testLessThan(15n, 15n, circuitLessThan);
    });

    it("15 < 16", async function () {
        await testLessThan(15n, 16n, circuitLessThan);
    });

    it("109730872847609188478309451572148122150330802072000585050763249942403213063436 < 109730872847609188478309451572148122150330802072000585050763249942403213063436", async function () {
        await testLessThan(109730872847609188478309451572148122150330802072000585050763249942403213063436n, 109730872847609188478309451572148122150330802072000585050763249942403213063436n, circuitLessThan);
    });

    it("109730872847609188478309451572148122150330802072000585050763249942403213063436 < 15", async function () {
        await testLessThan(109730872847609188478309451572148122150330802072000585050763249942403213063436n, 15n, circuitLessThan);
    });

    it("ff...fe (256 bit) < ff...ff (256 bit)", async function () {
        await testLessThan(115792089237316195423570985008687907853269984665640564039457584007913129639934n, 115792089237316195423570985008687907853269984665640564039457584007913129639935n, circuitLessThan);
    });

    it("15 <= 15", async function () {
        await testLessEqThan(15n, 15n, circuitLessEqThan);
    });

    it("15 <= 16", async function () {
        await testLessEqThan(15n, 16n, circuitLessEqThan);
    });

    it("109730872847609188478309451572148122150330802072000585050763249942403213063436 <= 109730872847609188478309451572148122150330802072000585050763249942403213063436", async function () {
        await testLessEqThan(109730872847609188478309451572148122150330802072000585050763249942403213063436n, 109730872847609188478309451572148122150330802072000585050763249942403213063436n, circuitLessEqThan);
    });

    it("109730872847609188478309451572148122150330802072000585050763249942403213063436 <= 15", async function () {
        await testLessEqThan(109730872847609188478309451572148122150330802072000585050763249942403213063436n, 15n, circuitLessEqThan);
    });

    it("ff...fe (256 bit) <= ff...ff (256 bit)", async function () {
        await testLessEqThan(115792089237316195423570985008687907853269984665640564039457584007913129639934n, 115792089237316195423570985008687907853269984665640564039457584007913129639935n, circuitLessEqThan);
    });

    it("15 > 15", async function () {
        await testGreaterThan(15n, 15n, circuitGreaterThan);
    });

    it("15 > 16", async function () {
        await testGreaterThan(15n, 16n, circuitGreaterThan);
    });

    it("109730872847609188478309451572148122150330802072000585050763249942403213063436 > 109730872847609188478309451572148122150330802072000585050763249942403213063436", async function () {
        await testGreaterThan(109730872847609188478309451572148122150330802072000585050763249942403213063436n, 109730872847609188478309451572148122150330802072000585050763249942403213063436n, circuitGreaterThan);
    });

    it("109730872847609188478309451572148122150330802072000585050763249942403213063436 > 15", async function () {
        await testGreaterThan(109730872847609188478309451572148122150330802072000585050763249942403213063436n, 15n, circuitGreaterThan);
    });

    it("ff...fe (256 bit) > ff...ff (256 bit)", async function () {
        await testGreaterThan(115792089237316195423570985008687907853269984665640564039457584007913129639934n, 115792089237316195423570985008687907853269984665640564039457584007913129639935n, circuitGreaterThan);
    });

    it("15 >= 15", async function () {
        await testGreaterEqThan(15n, 15n, circuitGreaterEqThan);
    });

    it("15 >= 16", async function () {
        await testGreaterEqThan(15n, 16n, circuitGreaterEqThan);
    });

    it("109730872847609188478309451572148122150330802072000585050763249942403213063436 >= 109730872847609188478309451572148122150330802072000585050763249942403213063436", async function () {
        await testGreaterEqThan(109730872847609188478309451572148122150330802072000585050763249942403213063436n, 109730872847609188478309451572148122150330802072000585050763249942403213063436n, circuitGreaterEqThan);
    });

    it("109730872847609188478309451572148122150330802072000585050763249942403213063436 >= 15", async function () {
        await testGreaterEqThan(109730872847609188478309451572148122150330802072000585050763249942403213063436n, 15n, circuitGreaterEqThan);
    });

    it("ff...fe (256 bit) >= ff...ff (256 bit)", async function () {
        await testGreaterEqThan(115792089237316195423570985008687907853269984665640564039457584007913129639934n, 115792089237316195423570985008687907853269984665640564039457584007913129639935n, circuitGreaterEqThan);
    });
});

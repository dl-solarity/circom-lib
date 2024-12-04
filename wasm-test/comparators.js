const { assert, log } = require("console");
const path = require("path");

const Scalar = require("ffjavascript").Scalar;
const wasm_tester = require("circom_tester").wasm;

async function testIsZero(input, circuit){
    let real_result = [0n]
    if (input == 0n){
        real_result = [1n]
    }

    const w = await circuit.calculateWitness({in: input}, true);

    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `==0`);
    }

}

async function testIsEqual(input1, input2, circuit){
    let input = [input1, input2];

    let real_result = input1 == input2 ? [1n] : [0n];

    const w = await circuit.calculateWitness({in: input}, true);

    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `==`)
    }
}

async function testIsGreater(input1, input2, circuit){
    let input = [input1, input2];

    let real_result = input1 > input2 ? [1n] : [0n];

    const w = await circuit.calculateWitness({in: input}, true);

    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `>`);
    }
}

async function testIsGreaterEq(input1, input2, circuit){
    let input = [input1, input2];

    let real_result = input1 >= input2 ? [1n] : [0n];

    const w = await circuit.calculateWitness({in: input}, true);

    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `>=`)
    }
}

async function testIsLessEq(input1, input2, circuit){
    let input = [input1, input2];

    let real_result = input1 <= input2 ? [1n] : [0n];

    const w = await circuit.calculateWitness({in: input}, true);

    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `<=`)
    }
}

async function testIsLess(input1, input2, circuit){
    let input = [input1, input2];

    let real_result = input1 < input2 ? [1n] : [0n];

    const w = await circuit.calculateWitness({in: input}, true);

    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `<`)
    }
}



describe("IsZero test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "isZero.circom"));
    });

    it("0 ?= 0", async function () {
        await testIsZero(0n, circuit);
    });

    it("1 ?= 0", async function () {
        await testIsZero(1n, circuit);
    });

});

describe("IsEqual test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "isEqual.circom"));
    });

    it("0 ?= 0", async function () {
        await testIsEqual(0n, 0n, circuit);
    });

    it("1 ?= 0", async function () {
        await testIsEqual(1n, 0n, circuit);
    });

    it("512 ?= 234", async function () {
        await testIsEqual(512n,234n, circuit);
    });

    it("512 ?= 512", async function () {
        await testIsEqual(512n, 512n, circuit);
    });

});


describe("IsGreater test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "greaterThan.circom"));
    });

    it("0 > 0", async function () {
        await testIsGreater(0n, 0n, circuit);
    });

    it("1 > 0", async function () {
        await testIsGreater(1n, 0n, circuit);
    });

    it("512 > 234", async function () {
        await testIsGreater(512n, 234n, circuit);
    });

    it("512 > 512", async function () {
        await testIsGreater(512n, 512n, circuit);
    });

});

describe("IsGreaterEq test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "greaterEqThan.circom"));
    });

    it("0 >= 0", async function () {
        await testIsGreaterEq(0n, 0n, circuit);
    });

    it("1 >= 0", async function () {
        await testIsGreaterEq(1n, 0n, circuit);
    });

    it("512 >= 234", async function () {
        await testIsGreaterEq(512n,234n, circuit);
    });

    it("512 >= 512", async function () {
        await testIsGreaterEq(512n, 512n, circuit);
    });

});

describe("IsLess test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "lessThan.circom"));
    });

    it("0 <= 0", async function () {
        await testIsLess(0n, 0n, circuit);
    });

    it("1 <= 0", async function () {
        await testIsLess(1n, 0n, circuit);
    });

    it("512 <= 234", async function () {
        await testIsLess(512n, 234n, circuit);
    });

    it("512 <= 512", async function () {
        await testIsLess(512n, 512n, circuit);
    });

});


describe("IsLessEq test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "lessEqThan.circom"));
    });

    it("0 <= 0", async function () {
        await testIsLessEq(0n, 0n, circuit);
    });

    it("1 <= 0", async function () {
        await testIsLessEq(1n, 0n, circuit);
    });

    it("512 <= 234", async function () {
        await testIsLessEq(512n,234n, circuit);
    });

    it("512 <= 512", async function () {
        await testIsLessEq(512n, 512n, circuit);
    });

});

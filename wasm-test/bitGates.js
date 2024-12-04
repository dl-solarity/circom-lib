const { assert } = require("console");
const path = require("path");

const Scalar = require("ffjavascript").Scalar;
const wasm_tester = require("circom_tester").wasm;

async function testA(input1, input2, circuit){
    let input = [input1, input2];

    const w = await circuit.calculateWitness({in: input}, true);
    let real_result = [input1];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `A(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testAnd(input1, input2, circuit){
    let input = [input1, input2];
    let real_result = [input1*input2];
    const w = await circuit.calculateWitness({in: input}, true);

    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `And(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testB(input1, input2, circuit){
    let input = [input1, input2];

    const w = await circuit.calculateWitness({in: input}, true);
    let real_result = [input2];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `$B({input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testBuffer(input1, circuit){

    const w = await circuit.calculateWitness({in: input1}, true);
    let real_result = [input1];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `${input1} -> ${real_result[i]}: ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testFalse(input1, input2, circuit){

    const w = await circuit.calculateWitness({in: [input1, input2]}, true);
    let real_result = [0n];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `false(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testNimply(input1, input2, circuit){

    const w = await circuit.calculateWitness({in: [input1, input2]}, true);
    let real_result = [input1 - input2 + (1n - input1) * input2];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `Imply(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testImply(input1, input2, circuit){

    const w = await circuit.calculateWitness({in: [input1, input2]}, true);
    let real_result = [1n - input1 + input2 - (1n - input1) * input2];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `Imply(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testInvImply(input1, input2, circuit){

    const w = await circuit.calculateWitness({in: [input1, input2]}, true);
    let real_result = [1n - input2 + input1 - (1n - input2) * input1];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `InvImply(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testNinvImply(input1, input2, circuit){

    const w = await circuit.calculateWitness({in: [input1, input2]}, true);
    let real_result = [input2 - input1 + (1n - input2) * input1];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `NInvImply(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testNor(input1, input2, circuit){

    const w = await circuit.calculateWitness({in: [input1, input2]}, true);
    let real_result = [1n - input1 + input2 + input1 * input2];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `Nor(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testNot(input1, circuit){

    const w = await circuit.calculateWitness({in: input1}, true);
    let real_result = [1n - input1];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `!${input1} ${real_result[i]}: ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testNotA(input1, input2, circuit){

    const w = await circuit.calculateWitness({in: [input1, input2]}, true);
    let real_result = [1n - input1];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `NotA(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testNotB(input1, input2, circuit){

    const w = await circuit.calculateWitness({in: [input1, input2]}, true);
    let real_result = [1n - input2];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `NotB(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}


async function testOr(input1, input2, circuit){

    const w = await circuit.calculateWitness({in: [input1, input2]}, true);
    let real_result = [input1 + input2 - input1*input2];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `Or(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testTrue(input1, input2, circuit){

    const w = await circuit.calculateWitness({in: [input1, input2]}, true);
    let real_result = [1n];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `True(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testXnor(input1, input2, circuit){

    const w = await circuit.calculateWitness({in: [input1, input2]}, true);
    let real_result = [1n - input1 - input2 + 2n * input1 * input2];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `True(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testXor(input1, input2, circuit){

    const w = await circuit.calculateWitness({in: [input1, input2]}, true);
    let real_result = [input1 + input2 - 2n * input1 * input2];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `True(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}

async function testNAnd(input1, input2, circuit){

    const w = await circuit.calculateWitness({in: [input1, input2]}, true);
    let real_result = [1n - input1 * input2];
    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == real_result[i], `True(${input1} ${input2}): ${circuit_result[i]}, ${real_result[i]}`);
    }
}





describe("Buffer test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "buffer.circom"));
    });

    it("1", async function () {
        await testBuffer(1n, circuit);
    });

    it("0", async function () {
        await testBuffer(0n, circuit);
    });

});

describe("Not test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "not.circom"));
    });

    it("1", async function () {
        await testNot(1n, circuit);
    });

    it("0", async function () {
        await testNot(0n, circuit);
    });

});

describe("And test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "and.circom"));
    });

    it("0 0", async function () {
        await testAnd(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testAnd(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testAnd(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testAnd(1n, 1n, circuit);
    });

});

describe("False test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "false.circom"));
    });

    it("0 0", async function () {
        await testFalse(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testFalse(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testFalse(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testFalse(1n, 1n, circuit);
    });

});

describe("A test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "a.circom"));
    });

    it("0 0", async function () {
        await testA(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testA(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testA(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testA(1n, 1n, circuit);
    });

});

describe("B test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "b.circom"));
    });

    it("0 0", async function () {
        await testB(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testB(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testB(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testB(1n, 1n, circuit);
    });

});

describe("Imply test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "imply.circom"));
    });

    it("0 0", async function () {
        await testImply(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testImply(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testImply(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testImply(1n, 1n, circuit);
    });
    
});

describe("InvImply test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "invimply.circom"));
    });

    it("0 0", async function () {
        await testInvImply(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testInvImply(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testInvImply(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testInvImply(1n, 1n, circuit);
    });

});

describe("NAnd test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "nand.circom"));
    });

    it("0 0", async function () {
        await testNAnd(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testNAnd(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testNAnd(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testNAnd(1n, 1n, circuit);
    });

});

describe("Nimply test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "nimply.circom"));
    });

    it("0 0", async function () {
        await testNimply(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testNimply(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testNimply(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testNimply(1n, 1n, circuit);
    });

});

describe("NInvImply test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "ninvimply.circom"));
    });

    it("0 0", async function () {
        await testNinvImply(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testNinvImply(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testNinvImply(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testNinvImply(1n, 1n, circuit);
    });

});

describe("Nor test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "nor.circom"));
    });

    it("0 0", async function () {
        await testNor(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testNor(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testNor(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testNor(1n, 1n, circuit);
    });

});

describe("NotA test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "nota.circom"));
    });

    it("0 0", async function () {
        await testNotA(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testNotA(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testNotA(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testNotA(1n, 1n, circuit);
    });

});

describe("NotB test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "notb.circom"));
    });

    it("0 0", async function () {
        await testNotB(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testNotB(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testNotB(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testNotB(1n, 1n, circuit);
    });

});

describe("Or test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "or.circom"));
    });

    it("0 0", async function () {
        await testOr(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testOr(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testOr(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testOr(1n, 1n, circuit);
    });

});

describe("True test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "true.circom"));
    });

    it("0 0", async function () {
        await testTrue(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testTrue(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testTrue(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testTrue(1n, 1n, circuit);
    });

});

describe("Xor test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "xor.circom"));
    });

    it("0 0", async function () {
        await testXor(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testXor(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testXor(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testXor(1n, 1n, circuit);
    });

});

describe("Xnor test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "bitify", "xnor.circom"));
    });

    it("0 0", async function () {
        await testXnor(0n, 0n, circuit);
    });

    it("1 0 ", async function () {
        await testXnor(1n, 0n, circuit);
    });

    it("0 1", async function () {
        await testXnor(0n, 1n, circuit);
    });

    it("1 1 ", async function () {
        await testXnor(1n, 1n, circuit);
    });

});


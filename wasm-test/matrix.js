const { assert, log } = require("console");
const path = require("path");
const math = require('mathjs');

const Scalar = require("ffjavascript").Scalar;
const wasm_tester = require("circom_tester").wasm;

function determinant(matrix) {
    const size = matrix.length;

    if (size === 1) {
        return matrix[0][0]; 
    }
    if (size === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }

    let det = 0;
    for (let col = 0; col < size; col++) {
        const minor = getMinor(matrix, 0, col); 
        det += Math.pow(-1, col) * matrix[0][col] * determinant(minor);
    }
    return det;
}

function getMinor(matrix, row, col) {
    return matrix
        .filter((_, r) => r !== row) 
        .map(row => row.filter((_, c) => c !== col)); 
}

function matrixMultiply(A, B) {
    const rowsA = A.length;
    const colsA = A[0].length;
    const rowsB = B.length;
    const colsB = B[0].length;

    // Check if the matrices can be multiplied
    if (colsA !== rowsB) {
        throw new Error("Matrices cannot be multiplied: incompatible dimensions.");
    }

    // Initialize the result matrix with zeros
    const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

    // Perform multiplication
    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            for (let k = 0; k < colsA; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }

    return result;
}

function performConvolution(matrix, filter, step) {
    const output = [];
    const filterSize = filter.length;
    const matrixSize = matrix.length;

    for (let i = 0; i <= matrixSize - filterSize; i += step) {
        for (let j = 0; j <= matrixSize - filterSize; j += step) {
            let sum = 0;

            for (let fi = 0; fi < filterSize; fi++) {
                for (let fj = 0; fj < filterSize; fj++) {
                    sum += matrix[i + fi][j + fj] * filter[fi][fj];
                }
            }

            output.push(sum);
        }
    }

    return output;
}
function transposeMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;

    const transposed = Array.from({ length: cols }, () => Array(rows).fill(0));

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            transposed[j][i] = matrix[i][j];
        }
    }

    return transposed;
}


async function testMatrixAdd(input1, input2, circuit){
    const real_result = [];
    for (let i = 0; i < input1.length; i++) {
        for (let j = 0; j < input1[i].length; j++) {
            real_result.push(input1[i][j] + input2[i][j]);
        }
    }
    const w = await circuit.calculateWitness({in1: input1, in2: input2, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+16);

    for (var i = 0; i < 16; i++){
        assert(circuit_result[i] == real_result[i], `${input1} + ${input2}`);
    }

}

async function testMatrixDeterminant(input1, circuit){

    let real_result = determinant(input1);
    
    const w = await circuit.calculateWitness({in: input1, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+1);

    for (var i = 0; i < 1; i++){
        assert(circuit_result[i] == BigInt(real_result), `det(${input1})`);
    }

}

async function testMatrixConvolation(input1, input2, step, circuit){
    const real_result = performConvolution(input1, input2, step);

    const w = await circuit.calculateWitness({in: input1, filter: input2, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1 + real_result.length);

    for (var i = 0; i < real_result.length; i++){
        assert(circuit_result[i] == real_result[i], `${input1} conv ${input2}, step = ${step}`);
    }

}

async function testMatrixHadamard(input1, input2, circuit){
    const real_result = [];
    for (let i = 0; i < input1.length; i++) {
        for (let j = 0; j < input1[i].length; j++) {
            real_result.push(input1[i][j] * input2[i][j]);
        }
    }
    const w = await circuit.calculateWitness({in1: input1, in2: input2}, true);

    let circuit_result = w.slice(1, 1+16);

    for (var i = 0; i < 16; i++){
        assert(circuit_result[i] == real_result[i], `${input1} hadamard ${input2}`);
    }

}

async function testMatrixMultiply(input1, input2, circuit){
    let real_result = matrixMultiply(input1, input2).flat()

    const w = await circuit.calculateWitness({in1: input1, in2: input2, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+16);

    for (var i = 0; i < 16; i++){
        assert(circuit_result[i] == BigInt(real_result[i]), `${input1} * ${input2}`);
    }

}

async function testMatrixVecMultiply(input1, input2, circuit){
    let real_result = matrixMultiply(input1, input2).flat()

    const w = await circuit.calculateWitness({in1: input1, in2: input2, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+real_result.length);


    for (var i = 0; i < real_result.length; i++){
        assert(circuit_result[i] == BigInt(real_result[i]), `${input1} * ${input2}`);
    }

}

async function testMatrixPow(input1, circuit){
    let real_result = matrixMultiply(matrixMultiply(input1, input1), input1).flat()

    const w = await circuit.calculateWitness({in: input1, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+16);

    for (var i = 0; i < 16; i++){
        assert(circuit_result[i] == BigInt(real_result[i]), `${input1} ** 3`);
    }

}

async function testMatrixScalar(input1, input2, circuit){
    const real_result = [];
    for (let i = 0; i < input1.length; i++) {
        for (let j = 0; j < input1[i].length; j++) {
            real_result.push(input1[i][j] * input2);
        }
    }
    const w = await circuit.calculateWitness({in: input1, scalar: input2, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+16);

    for (var i = 0; i < 16; i++){
        assert(circuit_result[i] == real_result[i], `${input1} scalar ${input2}`);
    }

}
async function testMatrixTransposition(input1, circuit){
    const real_result = transposeMatrix(input1).flat();

    const w = await circuit.calculateWitness({in: input1}, true);

    let circuit_result = w.slice(1, 1+12);

    for (var i = 0; i < 12; i++){
        assert(circuit_result[i] == real_result[i], `${input1} ^ T`);
    }

}

describe("Matrix add test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "matrix", "add.circom"));
    });

    it("[[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]] + [[15,14,13,12], [11,10,9,8], [7,6,5,4], [3, 2, 1, 0]]", async function () {
        await testMatrixAdd([[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], [[15,14,13,12], [11,10,9,8], [7,6,5,4], [3, 2, 1, 0]], circuit);
    });

    it("[[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]] + [[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]]", async function () {
        await testMatrixAdd([[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], [[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], circuit);
    });

});

describe("Matrix convalution test", function () {

    this.timeout(100000);
    let circuit1;
    let circuit2;

    before(async () => {
        circuit1 = await wasm_tester(path.join(__dirname, "circuits", "matrix", "convolution.circom"));
        circuit2 = await wasm_tester(path.join(__dirname, "circuits", "matrix", "convolution2.circom"));
    });

    it("[[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]] conv [[2,2],[3,3]], step 1", async function () {
        await testMatrixConvolation([[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], [[2,2],[3,3]], 1, circuit1);
    });

    it("[[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]] conv [[2,2],[3,3]], step 2", async function () {
        await testMatrixConvolation([[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], [[2,2],[3,3]], 2, circuit2);
    });

});

describe("Matrix determinant test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "matrix", "determinant.circom"));
    });

    it("det([[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]])", async function () {
        await testMatrixDeterminant([[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], circuit);
    });

});

describe("Matrix hadamard product test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "matrix", "hadamard.circom"));
    });

    it("[[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]] hadamard [[15,14,13,12], [11,10,9,8], [7,6,5,4], [3, 2, 1, 0]]", async function () {
        await testMatrixHadamard([[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], [[15,14,13,12], [11,10,9,8], [7,6,5,4], [3, 2, 1, 0]], circuit);
    });

    it("[[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]] hadamard [[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]]", async function () {
        await testMatrixHadamard([[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], [[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], circuit);
    });

});

describe("Matrix multiply test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "matrix", "multiply.circom"));
    });

    it("[[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]] * [[15,14,13,12], [11,10,9,8], [7,6,5,4], [3, 2, 1, 0]]", async function () {
        await testMatrixMultiply([[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], [[15,14,13,12], [11,10,9,8], [7,6,5,4], [3, 2, 1, 0]], circuit);
    });

    it("[[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]] * [[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]]", async function () {
        await testMatrixMultiply([[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], [[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], circuit);
    });

});

describe("Matrix vector multiply test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "matrix", "multiplyVec.circom"));
    });

    it("[[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]] * [[15], [11], [4], [1]]", async function () {
        await testMatrixVecMultiply([[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], [[15], [11], [4], [1]], circuit);
    });

});

describe("Matrix power test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "matrix", "pow.circom"));
    });

    it("[[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]] ** 3", async function () {
        await testMatrixPow([[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], circuit);
    });

});

describe("Matrix scalar mult test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "matrix", "scalar.circom"));
    });

    it("[[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]] * 3", async function () {
        await testMatrixScalar([[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]], 3, circuit);
    });

});

describe("Matrix transposition test", function () {

    this.timeout(100000);
    let circuit;

    before(async () => {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "matrix", "transposition.circom"));
    });

    it("[[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]]", async function () {
        await testMatrixTransposition([[0,1,2], [4,5,6], [8,9,10], [12,13,14]], circuit);
    });

});
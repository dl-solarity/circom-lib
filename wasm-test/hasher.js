const { assert } = require("console");
const path = require("path");

const Scalar = require("ffjavascript").Scalar;
const wasm_tester = require("circom_tester").wasm;

const crypto = require('crypto');
const { read } = require("fs");



function hexToBitArray(hexStr) {
    const bitArray = [];
    for (const hexChar of hexStr) {
        const binary = parseInt(hexChar, 16).toString(2).padStart(4, '0');
        bitArray.push(...binary.split('').map(bit => parseInt(bit, 10)));
    }

    return bitArray;
}

function shaPadding(hexStr, blockSize) {

    const binaryStr = hexStr
        .split('')
        .map(char => parseInt(char, 16).toString(2).padStart(4, '0'))
        .join('');

    const originalLength = binaryStr.length; 

    let paddedBinary = binaryStr + '1';

    const targetLength = Math.ceil((originalLength + 1 + 64) / blockSize) * blockSize;
    paddedBinary = paddedBinary.padEnd(targetLength - 64, '0');

    const lengthBinary = originalLength.toString(2).padStart(64, '0');
    paddedBinary += lengthBinary;

    const paddedHex = paddedBinary.match(/.{1,4}/g)
        .map(bin => parseInt(bin, 2).toString(16))
        .join('');

    return paddedHex;
}

async function testHash160Bits(input1, circuit){

    const input = hexToBitArray(input1)

    const w = await circuit.calculateWitness({in: input, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+160).join("");

    const buffer = Buffer.from(input1, 'hex');

    const hashBuffer = crypto.createHash('sha1')
        .update(buffer)
        .digest('hex');

    let real_result = hashBuffer.split('').map(hexChar => {
        return parseInt(hexChar, 16).toString(2).padStart(4, '0');
    }).join('');


    assert(circuit_result == real_result, `${real_result} != ${circuit_result}`);
}

async function testHash160Chunks(input1, circuit){

    const input = hexToBitArray(shaPadding(input1, 512))
    
    const w = await circuit.calculateWitness({in: input, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+160).join("");

    const buffer = Buffer.from(input1, 'hex');

    const hashBuffer = crypto.createHash('sha1')
        .update(buffer)
        .digest('hex');

    let real_result = hashBuffer.split('').map(hexChar => {
        return parseInt(hexChar, 16).toString(2).padStart(4, '0');
    }).join('');


    assert(circuit_result == real_result, `${real_result} != ${circuit_result}`);
}

async function testHash224Chunks(input1, circuit){

    const input = hexToBitArray(shaPadding(input1, 512))
    
    const w = await circuit.calculateWitness({in: input, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+224).join("");

    const buffer = Buffer.from(input1, 'hex');

    const hashBuffer = crypto.createHash('sha224')
        .update(buffer)
        .digest('hex');

    let real_result = hashBuffer.split('').map(hexChar => {
        return parseInt(hexChar, 16).toString(2).padStart(4, '0');
    }).join('');


    assert(circuit_result == real_result, `${real_result} != ${circuit_result}`);
}

async function testHash224Bits(input1, circuit){

    const input = hexToBitArray(input1)

    const w = await circuit.calculateWitness({in: input, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+224).join("");

    const buffer = Buffer.from(input1, 'hex');

    const hashBuffer = crypto.createHash('sha224')
        .update(buffer)
        .digest('hex');

    let real_result = hashBuffer.split('').map(hexChar => {
        return parseInt(hexChar, 16).toString(2).padStart(4, '0');
    }).join('');


    assert(circuit_result == real_result, `${real_result} != ${circuit_result}`);
}

async function testHash256Chunks(input1, circuit){

    const input = hexToBitArray(shaPadding(input1, 512))
    
    const w = await circuit.calculateWitness({in: input, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+256).join("");

    const buffer = Buffer.from(input1, 'hex');

    const hashBuffer = crypto.createHash('sha256')
        .update(buffer)
        .digest('hex');

    let real_result = hashBuffer.split('').map(hexChar => {
        return parseInt(hexChar, 16).toString(2).padStart(4, '0');
    }).join('');


    assert(circuit_result == real_result, `${real_result} != ${circuit_result}`);
}

async function testHash256Bits(input1, circuit){

    const input = hexToBitArray(input1)

    const w = await circuit.calculateWitness({in: input, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+256).join("");

    const buffer = Buffer.from(input1, 'hex');

    const hashBuffer = crypto.createHash('sha256')
        .update(buffer)
        .digest('hex');

    let real_result = hashBuffer.split('').map(hexChar => {
        return parseInt(hexChar, 16).toString(2).padStart(4, '0');
    }).join('');


    assert(circuit_result == real_result, `${real_result} != ${circuit_result}`);
}

async function testHash384Chunks(input1, circuit){

    const input = hexToBitArray(shaPadding(input1, 1024))
    
    const w = await circuit.calculateWitness({in: input, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+384).join("");

    const buffer = Buffer.from(input1, 'hex');

    const hashBuffer = crypto.createHash('sha384')
        .update(buffer)
        .digest('hex');

    let real_result = hashBuffer.split('').map(hexChar => {
        return parseInt(hexChar, 16).toString(2).padStart(4, '0');
    }).join('');


    assert(circuit_result == real_result, `${real_result} != ${circuit_result}`);
}

async function testHash384Bits(input1, circuit){

    const input = hexToBitArray(input1)

    const w = await circuit.calculateWitness({in: input, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+384).join("");

    const buffer = Buffer.from(input1, 'hex');

    const hashBuffer = crypto.createHash('sha384')
        .update(buffer)
        .digest('hex');

    let real_result = hashBuffer.split('').map(hexChar => {
        return parseInt(hexChar, 16).toString(2).padStart(4, '0');
    }).join('');


    assert(circuit_result == real_result, `${real_result} != ${circuit_result}`);
}

async function testHash512Chunks(input1, circuit){

    const input = hexToBitArray(shaPadding(input1, 1024))
    
    const w = await circuit.calculateWitness({in: input, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+512).join("");

    const buffer = Buffer.from(input1, 'hex');

    const hashBuffer = crypto.createHash('sha512')
        .update(buffer)
        .digest('hex');

    let real_result = hashBuffer.split('').map(hexChar => {
        return parseInt(hexChar, 16).toString(2).padStart(4, '0');
    }).join('');


    assert(circuit_result == real_result, `${real_result} != ${circuit_result}`);
}

async function testHash512Bits(input1, circuit){

    const input = hexToBitArray(input1)

    const w = await circuit.calculateWitness({in: input, dummy: 0n}, true);

    let circuit_result = w.slice(1, 1+512).join("");

    const buffer = Buffer.from(input1, 'hex');

    const hashBuffer = crypto.createHash('sha512')
        .update(buffer)
        .digest('hex');

    let real_result = hashBuffer.split('').map(hexChar => {
        return parseInt(hexChar, 16).toString(2).padStart(4, '0');
    }).join('');


    assert(circuit_result == real_result, `${real_result} != ${circuit_result}`);
}

async function testPoseidon(input1, circuit){

    const hash_0 = 19014214495641488759237505126948346942972912379615652741039992445865937985820n
    const hash_0_1 = 12583541437132735734108669866114103169564651237895298778035846191048104863326n

    const w = await circuit.calculateWitness({in: input1, dummy: 0n}, true);
    let circuit_result = w.slice(1, 1+1)
    if (input1[0] == 0n && input1[1] == 1n){
        assert(circuit_result == hash_0_1, `${hash_0_1} != ${circuit_result}`);
    } else {
        assert(circuit_result == hash_0, `${hash_0} != ${circuit_result}`);
    }
}


describe("Hash 160 test", function () {

    this.timeout(10000000);
    let circuit1;
    let circuit2;

    before(async () => {
        circuit1 = await wasm_tester(path.join(__dirname, "circuits", "hasher", "hashBits160.circom"));
    });

    before(async () => {
        circuit2 = await wasm_tester(path.join(__dirname, "circuits", "hasher", "hashChunks160.circom"));
    });

    it("Hash bits sha-1 (0x00)", async function () {
        await testHash160Bits("00", circuit1);
    });

    it("Hash chunks sha-1 (0x00)", async function () {
        await testHash160Chunks("00", circuit2);
    })

});


describe("Hash 224 test", function () {

    this.timeout(10000000);
    let circuit1;
    let circuit2;

    before(async () => {
        circuit1 = await wasm_tester(path.join(__dirname, "circuits", "hasher", "hashBits224.circom"));
    });

    before(async () => {
        circuit2 = await wasm_tester(path.join(__dirname, "circuits", "hasher", "hashChunks224.circom"));
    });

    it("Hash bits sha2-224 (0x00)", async function () {
        await testHash224Bits("00", circuit1);
    });

    it("Hash chunks sha2-224 (0x00)", async function () {
        await testHash224Chunks("00", circuit2);
    })

});


describe("Hash 256 test", function () {

    this.timeout(10000000);
    let circuit1;
    let circuit2;

    before(async () => {
        circuit1 = await wasm_tester(path.join(__dirname, "circuits", "hasher", "hashBits256.circom"));
    });

    before(async () => {
        circuit2 = await wasm_tester(path.join(__dirname, "circuits", "hasher", "hashChunks256.circom"));
    });

    it("Hash bits sha2-256 (0x00)", async function () {
        await testHash256Bits("00", circuit1);
    });

    it("Hash chunks sha2-256 (0x00)", async function () {
        await testHash256Chunks("00", circuit2);
    })

});


describe("Hash 384 test", function () {

    this.timeout(10000000);
    let circuit1;
    let circuit2;

    before(async () => {
        circuit1 = await wasm_tester(path.join(__dirname, "circuits", "hasher", "hashBits384.circom"));
    });

    before(async () => {
        circuit2 = await wasm_tester(path.join(__dirname, "circuits", "hasher", "hashChunks384.circom"));
    });

    it("Hash bits sha2-384 (0x00)", async function () {
        await testHash384Bits("00", circuit1);
    });

    it("Hash chunks sha2-384 (0x00)", async function () {
        await testHash384Chunks("00", circuit2);
    })

});


describe("Hash 512 test", function () {

    this.timeout(10000000);
    let circuit1;
    let circuit2;

    before(async () => {
        circuit1 = await wasm_tester(path.join(__dirname, "circuits", "hasher", "hashBits512.circom"));
    });

    before(async () => {
        circuit2 = await wasm_tester(path.join(__dirname, "circuits", "hasher", "hashChunks512.circom"));
    });

    it("Hash bits sha2-512 (0x00)", async function () {
        await testHash512Bits("00", circuit1);
    });

    it("Hash chunks sha2-512 (0x00)", async function () {
        await testHash512Chunks("00", circuit2);
    })

});


describe("Poseidon test", function () {

    this.timeout(10000000);
    let circuit1;
    let circuit2;

    before(async () => {
        circuit1 = await wasm_tester(path.join(__dirname, "circuits", "hasher", "poseidon1.circom"));
    });

    before(async () => {
        circuit2 = await wasm_tester(path.join(__dirname, "circuits", "hasher", "poseidon2.circom"));
    });

    it("Poseidon([0])", async function () {
        await testPoseidon([0n], circuit1);
    });

    it("Poseidon([0, 1])", async function () {
        await testPoseidon([0n, 1n], circuit2);
    })

});


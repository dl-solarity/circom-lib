import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "./helpers/reverter";
import { createHash } from "node:crypto";

import {
  PoseidonHash_1_Groth16Verifier,
  PoseidonHash_2_Groth16Verifier,
  ShaHashBits_8_160_Groth16Verifier,
  ShaHashBits_8_224_Groth16Verifier,
  ShaHashBits_8_256_Groth16Verifier,
  ShaHashBits_8_384_Groth16Verifier,
  ShaHashBits_8_512_Groth16Verifier,
  ShaHashChunks_1_160_Groth16Verifier,
  ShaHashChunks_1_224_Groth16Verifier,
  ShaHashChunks_1_256_Groth16Verifier,
  ShaHashChunks_1_384_Groth16Verifier,
  ShaHashChunks_1_512_Groth16Verifier,
} from "@/generated-types/ethers";

import { ShaHashBits as hashBits160 } from "@/generated-types/zkit/core/mock/hasher/";
import { ShaHashBits as hashBits224 } from "@/generated-types/zkit/core/mock/hasher/hashBits224.circom";
import { ShaHashBits as hashBits256 } from "@/generated-types/zkit/core/mock/hasher/hashBits256.circom";
import { ShaHashBits as hashBits384 } from "@/generated-types/zkit/core/mock/hasher/hashBits384.circom";
import { ShaHashBits as hashBits512 } from "@/generated-types/zkit/core/mock/hasher/hashBits512.circom";

import { ShaHashChunks as hashChunks160 } from "@/generated-types/zkit/core/mock/hasher";
import { ShaHashChunks as hashChunks224 } from "@/generated-types/zkit/core/mock/hasher/hashChunks224.circom";
import { ShaHashChunks as hashChunks256 } from "@/generated-types/zkit/core/mock/hasher/hashChunks256.circom";
import { ShaHashChunks as hashChunks384 } from "@/generated-types/zkit/core/mock/hasher/hashChunks384.circom";
import { ShaHashChunks as hashChunks512 } from "@/generated-types/zkit/core/mock/hasher/hashChunks512.circom";

import { PoseidonHash as poseidon1 } from "@/generated-types/zkit/core/mock/hasher";
import { PoseidonHash as poseidon2 } from "@/generated-types/zkit/core/mock/hasher/poseidon2.circom";

function hexToBitArray(hexStr: string) {
  const bitArray = [];

  for (const hexChar of hexStr) {
    const binary = parseInt(hexChar, 16).toString(2).padStart(4, "0");

    bitArray.push(...binary.split("").map((bit) => parseInt(bit, 10)));
  }

  return bitArray;
}

function shaPadding(hexStr: string, blockSize: number) {
  const binaryStr = hexStr
    .split("")
    .map((char) => parseInt(char, 16).toString(2).padStart(4, "0"))
    .join("");

  const originalLength = binaryStr.length;

  let paddedBinary = binaryStr + "1";

  const targetLength = Math.ceil((originalLength + 1 + 64) / blockSize) * blockSize;
  paddedBinary = paddedBinary.padEnd(targetLength - 64, "0");

  const lengthBinary = originalLength.toString(2).padStart(64, "0");
  paddedBinary += lengthBinary;

  const paddedHex = paddedBinary!
    .match(/.{1,4}/g)!
    .map((bin) => parseInt(bin, 2).toString(16))
    .join("");

  return paddedHex;
}

async function testHash160Chunks(input1: string, circuit: hashChunks160) {
  const input = hexToBitArray(shaPadding(input1, 512));

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 160).join("");

  const buffer = Buffer.from(input1, "hex");

  const hashBuffer = createHash("sha1").update(buffer).digest("hex");

  let real_result = hashBuffer
    .split("")
    .map((hexChar) => {
      return parseInt(hexChar, 16).toString(2).padStart(4, "0");
    })
    .join("");

  expect(circuit_result).to.be.eq(real_result, `${real_result} != ${circuit_result}`);

  const proofStruct = await circuit.generateProof({
    in: input,
    dummy: 0n,
  });

  return proofStruct;
}

async function testHash160Bits(input1: string, circuit: hashBits160) {
  const input = hexToBitArray(input1);

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 160).join("");

  const buffer = Buffer.from(input1, "hex");

  const hashBuffer = createHash("sha1").update(buffer).digest("hex");

  let real_result = hashBuffer
    .split("")
    .map((hexChar) => {
      return parseInt(hexChar, 16).toString(2).padStart(4, "0");
    })
    .join("");

  expect(circuit_result).to.be.eq(real_result, `${real_result} != ${circuit_result}`);

  const proofStruct = await circuit.generateProof({
    in: input,
    dummy: 0n,
  });

  return proofStruct;
}

async function testHash224Chunks(input1: string, circuit: hashChunks224) {
  const input = hexToBitArray(shaPadding(input1, 512));

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 224).join("");

  const buffer = Buffer.from(input1, "hex");

  const hashBuffer = createHash("sha224").update(buffer).digest("hex");

  let real_result = hashBuffer
    .split("")
    .map((hexChar) => {
      return parseInt(hexChar, 16).toString(2).padStart(4, "0");
    })
    .join("");

  expect(circuit_result).to.be.eq(real_result, `${real_result} != ${circuit_result}`);

  const proofStruct = await circuit.generateProof({
    in: input,
    dummy: 0n,
  });

  return proofStruct;
}

async function testHash224Bits(input1: string, circuit: hashBits224) {
  const input = hexToBitArray(input1);

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 224).join("");

  const buffer = Buffer.from(input1, "hex");

  const hashBuffer = createHash("sha224").update(buffer).digest("hex");

  let real_result = hashBuffer
    .split("")
    .map((hexChar) => {
      return parseInt(hexChar, 16).toString(2).padStart(4, "0");
    })
    .join("");

  expect(circuit_result).to.be.eq(real_result, `${real_result} != ${circuit_result}`);

  const proofStruct = await circuit.generateProof({
    in: input,
    dummy: 0n,
  });

  return proofStruct;
}

async function testHash256Chunks(input1: string, circuit: hashChunks256) {
  const input = hexToBitArray(shaPadding(input1, 512));

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 256).join("");

  const buffer = Buffer.from(input1, "hex");

  const hashBuffer = createHash("sha256").update(buffer).digest("hex");

  let real_result = hashBuffer
    .split("")
    .map((hexChar) => {
      return parseInt(hexChar, 16).toString(2).padStart(4, "0");
    })
    .join("");

  expect(circuit_result).to.be.eq(real_result, `${real_result} != ${circuit_result}`);

  const proofStruct = await circuit.generateProof({
    in: input,
    dummy: 0n,
  });

  return proofStruct;
}

async function testHash256Bits(input1: string, circuit: hashBits256) {
  const input = hexToBitArray(input1);

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 256).join("");

  const buffer = Buffer.from(input1, "hex");

  const hashBuffer = createHash("sha256").update(buffer).digest("hex");

  let real_result = hashBuffer
    .split("")
    .map((hexChar) => {
      return parseInt(hexChar, 16).toString(2).padStart(4, "0");
    })
    .join("");

  expect(circuit_result).to.be.eq(real_result, `${real_result} != ${circuit_result}`);

  const proofStruct = await circuit.generateProof({
    in: input,
    dummy: 0n,
  });

  return proofStruct;
}

async function testHash384Chunks(input1: string, circuit: hashChunks384) {
  const input = hexToBitArray(shaPadding(input1, 1024));

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 384).join("");

  const buffer = Buffer.from(input1, "hex");

  const hashBuffer = createHash("sha384").update(buffer).digest("hex");

  let real_result = hashBuffer
    .split("")
    .map((hexChar) => {
      return parseInt(hexChar, 16).toString(2).padStart(4, "0");
    })
    .join("");

  expect(circuit_result).to.be.eq(real_result, `${real_result} != ${circuit_result}`);

  const proofStruct = await circuit.generateProof({
    in: input,
    dummy: 0n,
  });

  return proofStruct;
}

async function testHash384Bits(input1: string, circuit: hashBits384) {
  const input = hexToBitArray(input1);

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 384).join("");

  const buffer = Buffer.from(input1, "hex");

  const hashBuffer = createHash("sha384").update(buffer).digest("hex");

  let real_result = hashBuffer
    .split("")
    .map((hexChar) => {
      return parseInt(hexChar, 16).toString(2).padStart(4, "0");
    })
    .join("");

  expect(circuit_result).to.be.eq(real_result, `${real_result} != ${circuit_result}`);

  const proofStruct = await circuit.generateProof({
    in: input,
    dummy: 0n,
  });

  return proofStruct;
}

async function testHash512Chunks(input1: string, circuit: hashChunks512) {
  const input = hexToBitArray(shaPadding(input1, 1024));

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 512).join("");

  const buffer = Buffer.from(input1, "hex");

  const hashBuffer = createHash("sha512").update(buffer).digest("hex");

  let real_result = hashBuffer
    .split("")
    .map((hexChar) => {
      return parseInt(hexChar, 16).toString(2).padStart(4, "0");
    })
    .join("");

  expect(circuit_result).to.be.eq(real_result, `${real_result} != ${circuit_result}`);

  const proofStruct = await circuit.generateProof({
    in: input,
    dummy: 0n,
  });

  return proofStruct;
}

async function testHash512Bits(input1: string, circuit: hashBits512) {
  const input = hexToBitArray(input1);

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 512).join("");

  const buffer = Buffer.from(input1, "hex");

  const hashBuffer = createHash("sha512").update(buffer).digest("hex");

  let real_result = hashBuffer
    .split("")
    .map((hexChar) => {
      return parseInt(hexChar, 16).toString(2).padStart(4, "0");
    })
    .join("");

  expect(circuit_result).to.be.eq(real_result, `${real_result} != ${circuit_result}`);

  const proofStruct = await circuit.generateProof({
    in: input,
    dummy: 0n,
  });

  return proofStruct;
}

async function testPoseidon(input1: bigint[], circuit: poseidon1 | poseidon2) {
  const hash_0 = 19014214495641488759237505126948346942972912379615652741039992445865937985820n;
  const hash_0_1 = 12583541437132735734108669866114103169564651237895298778035846191048104863326n;

  const w = await circuit.calculateWitness({ in: input1, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 1);

  if (input1[0] == 0n && input1[1] == 1n) {
    expect(circuit_result[0]).to.be.eq(hash_0_1, `${hash_0_1} != ${circuit_result}`);
  } else {
    expect(circuit_result[0]).to.be.eq(hash_0, `${hash_0} != ${circuit_result}`);
  }

  const proofStruct = await circuit.generateProof({
    in: input1,
    dummy: 0n,
  });

  return proofStruct;
}

describe("Hash 160 test", function () {
  const reverter = new Reverter();

  let verifierBits: ShaHashBits_8_160_Groth16Verifier;
  let verifierChunks: ShaHashChunks_1_160_Groth16Verifier;

  let circuitBits: hashBits160;
  let circuitChunks: hashChunks160;

  before("setup", async () => {
    const bitsMockVerifier = await ethers.getContractFactory("ShaHashBits_8_160_Groth16Verifier");
    const chunkMockVerifier = await ethers.getContractFactory("ShaHashChunks_1_160_Groth16Verifier");

    verifierBits = await bitsMockVerifier.deploy();
    verifierChunks = await chunkMockVerifier.deploy();

    circuitBits = await zkit.getCircuit("circuits/mock/hasher/hashBits160.circom:ShaHashBits");
    circuitChunks = await zkit.getCircuit("circuits/mock/hasher/hashChunks160.circom:ShaHashChunks");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("Hash bits sha-1 (0x00)", async function () {
    const proof = await testHash160Bits("00", circuitBits);

    await expect(circuitBits).to.useSolidityVerifier(verifierBits).and.verifyProof(proof);
  });

  it("Hash chunks sha-1 (0x00)", async function () {
    const proof = await testHash160Chunks("00", circuitChunks);

    await expect(circuitChunks).to.useSolidityVerifier(verifierChunks).and.verifyProof(proof);
  });
});

describe("Hash 224 test", function () {
  const reverter = new Reverter();

  let verifierBits: ShaHashBits_8_224_Groth16Verifier;
  let verifierChunks: ShaHashChunks_1_224_Groth16Verifier;

  let circuitBits: hashBits224;
  let circuitChunks: hashChunks224;

  before("setup", async () => {
    const bitsMockVerifier = await ethers.getContractFactory("ShaHashBits_8_224_Groth16Verifier");
    const chunkMockVerifier = await ethers.getContractFactory("ShaHashChunks_1_224_Groth16Verifier");

    verifierBits = await bitsMockVerifier.deploy();
    verifierChunks = await chunkMockVerifier.deploy();

    circuitBits = await zkit.getCircuit("circuits/mock/hasher/hashBits224.circom:ShaHashBits");
    circuitChunks = await zkit.getCircuit("circuits/mock/hasher/hashChunks224.circom:ShaHashChunks");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("Hash bits sha2-224 (0x00)", async function () {
    const proof = await testHash224Bits("00", circuitBits);

    await expect(circuitBits).to.useSolidityVerifier(verifierBits).and.verifyProof(proof);
  });

  it("Hash chunks sha2-224 (0x00)", async function () {
    const proof = await testHash224Chunks("00", circuitChunks);

    await expect(circuitChunks).to.useSolidityVerifier(verifierChunks).and.verifyProof(proof);
  });
});

describe("Hash 256 test", function () {
  const reverter = new Reverter();

  let verifierChunks: ShaHashChunks_1_256_Groth16Verifier;
  let verifierBits: ShaHashBits_8_256_Groth16Verifier;

  let circuitChunks: hashChunks256;
  let circuitBits: hashBits256;

  before("setup", async () => {
    const bitsMockVerifier = await ethers.getContractFactory("ShaHashBits_8_256_Groth16Verifier");
    const chunkMockVerifier = await ethers.getContractFactory("ShaHashChunks_1_256_Groth16Verifier");

    verifierBits = await bitsMockVerifier.deploy();
    verifierChunks = await chunkMockVerifier.deploy();

    circuitBits = await zkit.getCircuit("circuits/mock/hasher/hashBits256.circom:ShaHashBits");
    circuitChunks = await zkit.getCircuit("circuits/mock/hasher/hashChunks256.circom:ShaHashChunks");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("Hash bits sha2-256 (0x00)", async function () {
    const proof = await testHash256Bits("00", circuitBits);

    await expect(circuitBits).to.useSolidityVerifier(verifierBits).and.verifyProof(proof);
  });

  it("Hash chunks sha2-256 (0x00)", async function () {
    const proof = await testHash256Chunks("00", circuitChunks);

    await expect(circuitChunks).to.useSolidityVerifier(verifierChunks).and.verifyProof(proof);
  });
});

describe("Hash 384 test", function () {
  const reverter = new Reverter();

  let verifierChunks: ShaHashChunks_1_384_Groth16Verifier;
  let verifierBits: ShaHashBits_8_384_Groth16Verifier;

  let circuitChunks: hashChunks384;
  let circuitBits: hashBits384;

  before("setup", async () => {
    const bitsMockVerifier = await ethers.getContractFactory("ShaHashBits_8_384_Groth16Verifier");
    const chunkMockVerifier = await ethers.getContractFactory("ShaHashChunks_1_384_Groth16Verifier");

    verifierBits = await bitsMockVerifier.deploy();
    verifierChunks = await chunkMockVerifier.deploy();

    circuitBits = await zkit.getCircuit("circuits/mock/hasher/hashBits384.circom:ShaHashBits");
    circuitChunks = await zkit.getCircuit("circuits/mock/hasher/hashChunks384.circom:ShaHashChunks");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("Hash bits sha2-384 (0x00)", async function () {
    const proof = await testHash384Bits("00", circuitBits);

    await expect(circuitBits).to.useSolidityVerifier(verifierBits).and.verifyProof(proof);
  });

  it("Hash chunks sha2-384 (0x00)", async function () {
    const proof = await testHash384Chunks("00", circuitChunks);

    await expect(circuitChunks).to.useSolidityVerifier(verifierChunks).and.verifyProof(proof);
  });
});

describe("Hash 512 test", function () {
  const reverter = new Reverter();

  let verifierChunks: ShaHashChunks_1_512_Groth16Verifier;
  let verifierBits: ShaHashBits_8_512_Groth16Verifier;

  let circuitChunks: hashChunks512;
  let circuitBits: hashBits512;

  before("setup", async () => {
    const bitsMockVerifier = await ethers.getContractFactory("ShaHashBits_8_512_Groth16Verifier");
    const chunkMockVerifier = await ethers.getContractFactory("ShaHashChunks_1_512_Groth16Verifier");

    verifierBits = await bitsMockVerifier.deploy();
    verifierChunks = await chunkMockVerifier.deploy();

    circuitBits = await zkit.getCircuit("circuits/mock/hasher/hashBits512.circom:ShaHashBits");
    circuitChunks = await zkit.getCircuit("circuits/mock/hasher/hashChunks512.circom:ShaHashChunks");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("Hash bits sha2-512 (0x00)", async function () {
    const proof = await testHash512Bits("00", circuitBits);

    await expect(circuitBits).to.useSolidityVerifier(verifierBits).and.verifyProof(proof);
  });

  it("Hash chunks sha2-512 (0x00)", async function () {
    const proof = await testHash512Chunks("00", circuitChunks);

    await expect(circuitChunks).to.useSolidityVerifier(verifierChunks).and.verifyProof(proof);
  });
});

describe("Poseidon test", function () {
  const reverter = new Reverter();

  let verifier1: PoseidonHash_1_Groth16Verifier;
  let verifier2: PoseidonHash_2_Groth16Verifier;

  let circuit1: poseidon1;
  let circuit2: poseidon2;

  before("setup", async () => {
    const MockVerifier1 = await ethers.getContractFactory("PoseidonHash_1_Groth16Verifier");
    const MockVerifier2 = await ethers.getContractFactory("PoseidonHash_2_Groth16Verifier");

    verifier1 = await MockVerifier1.deploy();
    verifier2 = await MockVerifier2.deploy();

    circuit1 = await zkit.getCircuit("circuits/mock/hasher/poseidon1.circom:PoseidonHash");
    circuit2 = await zkit.getCircuit("circuits/mock/hasher/poseidon2.circom:PoseidonHash");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("Poseidon([0])", async function () {
    const proof = await testPoseidon([0n], circuit1);

    await expect(circuit1).to.useSolidityVerifier(verifier1).and.verifyProof(proof);
  });

  it("Poseidon([0, 1])", async function () {
    const proof = await testPoseidon([0n, 1n], circuit2);

    await expect(circuit2).to.useSolidityVerifier(verifier2).and.verifyProof(proof);
  });
});
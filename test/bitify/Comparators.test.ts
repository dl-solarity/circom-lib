import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";

import { GreaterEqThan, GreaterThan, IsEqual, IsZero, LessEqThan, LessThan } from "@/generated-types/zkit";
import {
  GreaterEqThanGroth16Verifier,
  GreaterThanGroth16Verifier,
  IsEqualGroth16Verifier,
  IsZeroGroth16Verifier,
  LessEqThanGroth16Verifier,
  LessThanGroth16Verifier,
} from "@/generated-types/ethers";

async function testIsZero(input: bigint, circuit: IsZero) {
  let real_result = 0n;

  if (input == 0n) {
    real_result = 1n;
  }

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testIsEqual(input1: bigint, input2: bigint, circuit: IsEqual) {
  const input = [input1, input2];
  const real_result = input1 == input2 ? 1n : 0n;

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testIsGreater(input1: bigint, input2: bigint, circuit: GreaterThan) {
  const input = [input1, input2];
  const real_result = input1 > input2 ? 1n : 0n;

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testIsGreaterEq(input1: bigint, input2: bigint, circuit: GreaterEqThan) {
  const input = [input1, input2];
  const real_result = input1 >= input2 ? 1n : 0n;

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testIsLessEq(input1: bigint, input2: bigint, circuit: LessEqThan) {
  const input = [input1, input2];
  const real_result = input1 <= input2 ? 1n : 0n;

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testIsLess(input1: bigint, input2: bigint, circuit: LessThan) {
  const input = [input1, input2];
  const real_result = input1 < input2 ? 1n : 0n;

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

describe("IsZero test", () => {
  const reverter = new Reverter();

  let verifier: IsZeroGroth16Verifier;
  let circuit: IsZero;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("IsZeroGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("IsZero");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 ?= 0", async () => {
    const proof = await testIsZero(0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 ?= 0", async () => {
    const proof = await testIsZero(1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("IsEqual test", () => {
  const reverter = new Reverter();

  let verifier: IsEqualGroth16Verifier;
  let circuit: IsEqual;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("IsEqualGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("IsEqual");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 ?= 0", async () => {
    const proof = await testIsEqual(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 ?= 0", async () => {
    const proof = await testIsEqual(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("512 ?= 234", async () => {
    const proof = await testIsEqual(512n, 234n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("512 ?= 512", async () => {
    const proof = await testIsEqual(512n, 512n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("IsGreater test", () => {
  const reverter = new Reverter();

  let verifier: GreaterThanGroth16Verifier;
  let circuit: GreaterThan;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("GreaterThanGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("GreaterThan");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 > 0", async () => {
    const proof = await testIsGreater(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 > 0", async () => {
    const proof = await testIsGreater(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("512 > 234", async () => {
    const proof = await testIsGreater(512n, 234n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("512 > 512", async () => {
    const proof = await testIsGreater(512n, 512n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("IsGreaterEq test", () => {
  const reverter = new Reverter();

  let verifier: GreaterEqThanGroth16Verifier;
  let circuit: GreaterEqThan;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("GreaterEqThanGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("GreaterEqThan");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 >= 0", async () => {
    const proof = await testIsGreaterEq(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 >= 0", async () => {
    const proof = await testIsGreaterEq(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("512 >= 234", async () => {
    const proof = await testIsGreaterEq(512n, 234n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("512 >= 512", async () => {
    const proof = await testIsGreaterEq(512n, 512n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("IsLess test", () => {
  const reverter = new Reverter();

  let verifier: LessThanGroth16Verifier;
  let circuit: LessThan;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("LessThanGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("LessThan");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 <= 0", async () => {
    const proof = await testIsLess(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 <= 0", async () => {
    const proof = await testIsLess(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("512 <= 234", async () => {
    const proof = await testIsLess(512n, 234n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("512 <= 512", async () => {
    const proof = await testIsLess(512n, 512n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("IsLessEq test", () => {
  const reverter = new Reverter();

  let verifier: LessEqThanGroth16Verifier;
  let circuit: LessEqThan;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("LessEqThanGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("LessEqThan");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 <= 0", async () => {
    const proof = await testIsLessEq(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 <= 0", async () => {
    const proof = await testIsLessEq(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("512 <= 234", async () => {
    const proof = await testIsLessEq(512n, 234n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("512 <= 512", async () => {
    const proof = await testIsLessEq(512n, 512n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

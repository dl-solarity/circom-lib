import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";
import { bigIntToArray } from "../helpers/helperFunctions";

import {
  BigGreaterEqThanGroth16Verifier,
  BigGreaterThanGroth16Verifier,
  BigIsEqualGroth16Verifier,
  BigLessEqThanGroth16Verifier,
  BigLessThanGroth16Verifier,
} from "@/generated-types/ethers";

import { BigGreaterEqThan, BigGreaterThan, BigIsEqual, BigLessEqThan, BigLessThan } from "@/generated-types/zkit";

async function testIsEqual(input1: bigint, input2: bigint, circuit: BigIsEqual) {
  const input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  let real_result = 1n;

  if (input1 != input2) {
    real_result = 0n;
  }

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testLessThan(input1: bigint, input2: bigint, circuit: BigLessThan) {
  const input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  let real_result = 1n;

  if (input1 >= input2) {
    real_result = 0n;
  }

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testLessEqThan(input1: bigint, input2: bigint, circuit: BigLessEqThan) {
  const input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  let real_result = 1n;

  if (input1 > input2) {
    real_result = 0n;
  }

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testGreaterThan(input1: bigint, input2: bigint, circuit: BigGreaterThan) {
  const input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  let real_result = 1n;

  if (input1 <= input2) {
    real_result = 0n;
  }

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testGreaterEqThan(input1: bigint, input2: bigint, circuit: BigGreaterEqThan) {
  const input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  let real_result = 1n;

  if (input1 < input2) {
    real_result = 0n;
  }

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

describe("Comparators tests", () => {
  const reverter = new Reverter();

  let verifierEqual: BigIsEqualGroth16Verifier;
  let verifierLessThan: BigLessThanGroth16Verifier;
  let verifierLessEqThan: BigLessEqThanGroth16Verifier;
  let verifierGreaterThan: BigGreaterThanGroth16Verifier;
  let verifierGreaterEqThan: BigGreaterEqThanGroth16Verifier;

  let circuitEqual: BigIsEqual;
  let circuitLessThan: BigLessThan;
  let circuitLessEqThan: BigLessEqThan;
  let circuitGreaterThan: BigGreaterThan;
  let circuitGreaterEqThan: BigGreaterEqThan;

  before("setup", async () => {
    const equalVerifier = await ethers.getContractFactory("BigIsEqualGroth16Verifier");
    verifierEqual = await equalVerifier.deploy();
    circuitEqual = await zkit.getCircuit("BigIsEqual");

    const lessThanVerifier = await ethers.getContractFactory("BigLessThanGroth16Verifier");
    verifierLessThan = await lessThanVerifier.deploy();
    circuitLessThan = await zkit.getCircuit("BigLessThan");

    const lessEqVerifier = await ethers.getContractFactory("BigLessEqThanGroth16Verifier");
    verifierLessEqThan = await lessEqVerifier.deploy();
    circuitLessEqThan = await zkit.getCircuit("BigLessEqThan");

    const greaterVerifier = await ethers.getContractFactory("BigGreaterThanGroth16Verifier");
    verifierGreaterThan = await greaterVerifier.deploy();
    circuitGreaterThan = await zkit.getCircuit("BigGreaterThan");

    const greaterEqVerifier = await ethers.getContractFactory("BigGreaterEqThanGroth16Verifier");
    verifierGreaterEqThan = await greaterEqVerifier.deploy();
    circuitGreaterEqThan = await zkit.getCircuit("BigGreaterEqThan");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("15 === 15", async () => {
    const proof = await testIsEqual(15n, 15n, circuitEqual);

    await expect(circuitEqual).to.useSolidityVerifier(verifierEqual).and.verifyProof(proof);
  });

  it("15 === 16", async () => {
    const proof = await testIsEqual(15n, 16n, circuitEqual);

    await expect(circuitEqual).to.useSolidityVerifier(verifierEqual).and.verifyProof(proof);
  });

  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 === 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testIsEqual(
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuitEqual,
    );

    await expect(circuitEqual).to.useSolidityVerifier(verifierEqual).and.verifyProof(proof);
  });

  it("15 === 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testIsEqual(
      15n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuitEqual,
    );

    await expect(circuitEqual).to.useSolidityVerifier(verifierEqual).and.verifyProof(proof);
  });

  it("ff...ff (256 bit) === ff...ff (256 bit)", async () => {
    const proof = await testIsEqual(
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      circuitEqual,
    );

    await expect(circuitEqual).to.useSolidityVerifier(verifierEqual).and.verifyProof(proof);
  });

  it("15 < 15", async () => {
    const proof = await testLessThan(15n, 15n, circuitLessThan);

    await expect(circuitLessThan).to.useSolidityVerifier(verifierLessThan).and.verifyProof(proof);
  });

  it("15 < 16", async () => {
    const proof = await testLessThan(15n, 16n, circuitLessThan);

    await expect(circuitLessThan).to.useSolidityVerifier(verifierLessThan).and.verifyProof(proof);
  });

  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 < 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testLessThan(
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuitLessThan,
    );

    await expect(circuitLessThan).to.useSolidityVerifier(verifierLessThan).and.verifyProof(proof);
  });

  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 < 15", async () => {
    const proof = await testLessThan(
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      15n,
      circuitLessThan,
    );

    await expect(circuitLessThan).to.useSolidityVerifier(verifierLessThan).and.verifyProof(proof);
  });

  it("ff...fe (256 bit) < ff...ff (256 bit)", async () => {
    const proof = await testLessThan(
      115792089237316195423570985008687907853269984665640564039457584007913129639934n,
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      circuitLessThan,
    );

    await expect(circuitLessThan).to.useSolidityVerifier(verifierLessThan).and.verifyProof(proof);
  });

  it("15 <= 15", async () => {
    const proof = await testLessEqThan(15n, 15n, circuitLessEqThan);

    await expect(circuitLessEqThan).to.useSolidityVerifier(verifierLessEqThan).and.verifyProof(proof);
  });

  it("15 <= 16", async () => {
    const proof = await testLessEqThan(15n, 16n, circuitLessEqThan);

    await expect(circuitLessEqThan).to.useSolidityVerifier(verifierLessEqThan).and.verifyProof(proof);
  });

  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 <= 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testLessEqThan(
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuitLessEqThan,
    );

    await expect(circuitLessEqThan).to.useSolidityVerifier(verifierLessEqThan).and.verifyProof(proof);
  });

  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 <= 15", async () => {
    const proof = await testLessEqThan(
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      15n,
      circuitLessEqThan,
    );

    await expect(circuitLessEqThan).to.useSolidityVerifier(verifierLessEqThan).and.verifyProof(proof);
  });

  it("ff...fe (256 bit) <= ff...ff (256 bit)", async () => {
    const proof = await testLessEqThan(
      115792089237316195423570985008687907853269984665640564039457584007913129639934n,
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      circuitLessEqThan,
    );

    await expect(circuitLessEqThan).to.useSolidityVerifier(verifierLessEqThan).and.verifyProof(proof);
  });

  it("15 > 15", async () => {
    const proof = await testGreaterThan(15n, 15n, circuitGreaterThan);

    await expect(circuitGreaterThan).to.useSolidityVerifier(verifierGreaterThan).and.verifyProof(proof);
  });

  it("15 > 16", async () => {
    const proof = await testGreaterThan(15n, 16n, circuitGreaterThan);

    await expect(circuitGreaterThan).to.useSolidityVerifier(verifierGreaterThan).and.verifyProof(proof);
  });

  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 > 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testGreaterThan(
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuitGreaterThan,
    );

    await expect(circuitGreaterThan).to.useSolidityVerifier(verifierGreaterThan).and.verifyProof(proof);
  });

  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 > 15", async () => {
    const proof = await testGreaterThan(
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      15n,
      circuitGreaterThan,
    );

    await expect(circuitGreaterThan).to.useSolidityVerifier(verifierGreaterThan).and.verifyProof(proof);
  });

  it("ff...fe (256 bit) > ff...ff (256 bit)", async () => {
    const proof = await testGreaterThan(
      115792089237316195423570985008687907853269984665640564039457584007913129639934n,
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      circuitGreaterThan,
    );

    await expect(circuitGreaterThan).to.useSolidityVerifier(verifierGreaterThan).and.verifyProof(proof);
  });

  it("15 >= 15", async () => {
    const proof = await testGreaterEqThan(15n, 15n, circuitGreaterEqThan);

    await expect(circuitGreaterEqThan).to.useSolidityVerifier(verifierGreaterEqThan).and.verifyProof(proof);
  });

  it("15 >= 16", async () => {
    const proof = await testGreaterEqThan(15n, 16n, circuitGreaterEqThan);

    await expect(circuitGreaterEqThan).to.useSolidityVerifier(verifierGreaterEqThan).and.verifyProof(proof);
  });

  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 >= 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testGreaterEqThan(
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuitGreaterEqThan,
    );

    await expect(circuitGreaterEqThan).to.useSolidityVerifier(verifierGreaterEqThan).and.verifyProof(proof);
  });

  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 >= 15", async () => {
    const proof = await testGreaterEqThan(
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      15n,
      circuitGreaterEqThan,
    );

    await expect(circuitGreaterEqThan).to.useSolidityVerifier(verifierGreaterEqThan).and.verifyProof(proof);
  });

  it("ff...fe (256 bit) >= ff...ff (256 bit)", async () => {
    const proof = await testGreaterEqThan(
      115792089237316195423570985008687907853269984665640564039457584007913129639934n,
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      circuitGreaterEqThan,
    );

    await expect(circuitGreaterEqThan).to.useSolidityVerifier(verifierGreaterEqThan).and.verifyProof(proof);
  });
});

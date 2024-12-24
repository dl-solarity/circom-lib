import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";
import { bigIntToArray } from "../helpers/bigIntToArray";

import { BigMult, BigMultNonEqual, BigMultOptimised, PowerMod } from "@/generated-types/zkit";
import {
  BigMultGroth16Verifier,
  BigMultNonEqualGroth16Verifier,
  BigMultOptimisedGroth16Verifier,
  PowerModGroth16Verifier,
} from "@/generated-types/ethers";

async function testMultiplying(input1: bigint, input2: bigint, circuit: BigMult | BigMultOptimised) {
  let input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  let real_result = bigIntToArray(64, 8, input1 * input2);

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 8);

  for (var i = 0; i < 8; i++) {
    expect(circuit_result[i]).to.be.eq(real_result[i], `${input1} * ${input2}`);
  }

  const proofStruct = await circuit.generateProof({
    in: input,
    dummy: 0n,
  });

  return proofStruct;
}

async function testPowMod(input1: bigint, input2: bigint, circuit: PowerMod) {
  let input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  let real_result = bigIntToArray(64, 4, input1 ** 65537n % input2);

  const w = await circuit.calculateWitness({ base: input[0], modulus: input[1], dummy: 0n });

  let circuit_result = w.slice(1, 1 + 4);

  for (var i = 0; i < 4; i++) {
    expect(circuit_result[i]).to.be.eq(real_result[i], `${input1} * ${input2}`);
  }

  const proofStruct = await circuit.generateProof({
    base: input[0],
    modulus: input[1],
    dummy: 0n,
  });

  return proofStruct;
}

async function testNonEqualMultiplying(input1: bigint, input2: bigint, circuit: BigMultNonEqual) {
  let input = [bigIntToArray(64, 6, input1), bigIntToArray(64, 4, input2)];

  let real_result = bigIntToArray(64, 10, input1 * input2);

  const w = await circuit.calculateWitness({ in1: input[0], in2: input[1], dummy: 0n });

  let circuit_result = w.slice(1, 1 + 10);

  for (var i = 0; i < 10; i++) {
    expect(circuit_result[i]).to.be.eq(real_result[i]);
  }

  const proofStruct = await circuit.generateProof({
    in1: input[0],
    in2: input[1],
    dummy: 0n,
  });

  return proofStruct;
}

describe("Big mult test (Equal)", () => {
  const reverter = new Reverter();

  let verifier: BigMultGroth16Verifier;
  let circuit: BigMult;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("BigMultGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("BigMult");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("15 * 15", async () => {
    const proof = await testMultiplying(15n, 15n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 * 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testMultiplying(
      1097308728476091884783095050763249942403213063436n,
      109730872847609188478309451572148122150330249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("15 * 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testMultiplying(
      15n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Big mult test (Karatsuba)", () => {
  const reverter = new Reverter();

  let verifier: BigMultOptimisedGroth16Verifier;
  let circuit: BigMultOptimised;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("BigMultOptimisedGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("BigMultOptimised");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("15 * 15", async () => {
    const proof = await testMultiplying(15n, 15n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 * 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testMultiplying(
      1097308728476091884783095050763249942403213063436n,
      109730872847609188478309451572148122150330249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("15 * 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testMultiplying(
      15n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Big Power Mod", () => {
  const reverter = new Reverter();

  let verifier: PowerModGroth16Verifier;
  let circuit: PowerMod;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("PowerModGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("PowerMod");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("109730872847648122150330249942403213063436n ** 65537 % 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testPowMod(
      109730872847648122150330249942403213063436n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Big mult test (NonEqual)", () => {
  const reverter = new Reverter();

  let verifier: BigMultNonEqualGroth16Verifier;
  let circuit: BigMultNonEqual;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("BigMultNonEqualGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("BigMultNonEqual");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933 * 15", async () => {
    const proof = await testNonEqualMultiplying(
      24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933n,
      15n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933 * 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testNonEqualMultiplying(
      24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("15 * 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testNonEqualMultiplying(
      15n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

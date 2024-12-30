import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "./helpers/reverter";

import { Division, DivisionStrict, Inverse, Log2Ceil, Log2CeilStrict } from "@/generated-types/zkit";
import {
  DivisionGroth16Verifier,
  DivisionStrictGroth16Verifier,
  InverseGroth16Verifier,
  Log2CeilGroth16Verifier,
  Log2CeilStrictGroth16Verifier,
} from "@/generated-types/ethers";

async function testInverse(input: bigint, circuit: Inverse) {
  let real_result = 1n;

  if (input == 2n) {
    real_result = 10944121435919637611123202872628637544274182200208017171849102093287904247809n;
  }

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testDivision(input1: bigint, input2: bigint, circuit: Division) {
  const input = [input1, input2];

  await expect(circuit)
    .with.witnessInputs({ in: input })
    .to.have.witnessOutputs({ div: input1 / input2, mod: input1 % input2 });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testDivisionStrict(input1: bigint, input2: bigint, circuit: DivisionStrict) {
  const input = [input1, input2];

  await expect(circuit)
    .with.witnessInputs({ in: input })
    .to.have.witnessOutputs({ div: input1 / input2, mod: input1 % input2 });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testLog(input: bigint, circuit: Log2CeilStrict) {
  let real_result = 0n;

  if (input != 1n) {
    const result = BigInt(Math.log2(Number(input - 1n)) - (Math.log2(Number(input - 1n)) % 1) + 1);
    real_result = result;
  }

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testLogRange(input: bigint, circuit: Log2Ceil) {
  let real_result = 0n;

  if (input != 1n) {
    const result = BigInt(Math.log2(Number(input - 1n)) - (Math.log2(Number(input - 1n)) % 1) + 1);
    real_result = result;
  }

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

describe("Inverse test", () => {
  const reverter = new Reverter();

  let verifier: InverseGroth16Verifier;
  let circuit: Inverse;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("InverseGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("Inverse");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("1 \\ 1", async () => {
    const proof = await testInverse(1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 \\ 2", async () => {
    const proof = await testInverse(2n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Division test", () => {
  const reverter = new Reverter();

  let verifier: DivisionGroth16Verifier;
  let circuit: Division;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("DivisionGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("Division");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("7 / 3", async () => {
    const proof = await testDivision(7n, 3n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("500 / 34", async () => {
    const proof = await testDivision(500n, 34n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("140 / 20", async () => {
    const proof = await testDivision(140n, 20n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Division (strict) test", () => {
  const reverter = new Reverter();

  let verifier: DivisionStrictGroth16Verifier;
  let circuit: DivisionStrict;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("DivisionStrictGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("DivisionStrict");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("7 / 3", async () => {
    const proof = await testDivisionStrict(7n, 3n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("500 / 34", async () => {
    const proof = await testDivisionStrict(500n, 34n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("140 / 20", async () => {
    const proof = await testDivisionStrict(140n, 20n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Log2 (Strict) test", () => {
  const reverter = new Reverter();

  let verifier: Log2CeilStrictGroth16Verifier;
  let circuit: Log2CeilStrict;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("Log2CeilStrictGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("Log2CeilStrict");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("log(1)", async () => {
    const proof = await testLog(1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("log(2)", async () => {
    const proof = await testLog(2n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("log(127364283)", async () => {
    const proof = await testLog(127364283n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("log(5)", async () => {
    const proof = await testLog(5n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("log(4)", async () => {
    const proof = await testLog(4n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Log2 test", () => {
  const reverter = new Reverter();

  let verifier: Log2CeilGroth16Verifier;
  let circuit: Log2Ceil;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("Log2CeilGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("Log2Ceil");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("log(1)", async () => {
    const proof = await testLogRange(1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("log(2)", async () => {
    const proof = await testLogRange(2n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("log(127364283)", async () => {
    const proof = await testLogRange(127364283n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("log(5)", async () => {
    const proof = await testLogRange(5n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("log(4)", async () => {
    const proof = await testLogRange(4n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

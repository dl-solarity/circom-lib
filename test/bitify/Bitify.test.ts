import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";

import { Bits2Num, Num2Bits } from "@/generated-types/zkit";
import { Bits2NumGroth16Verifier, Num2BitsGroth16Verifier } from "@/generated-types/ethers";

async function testNum2Bits(input: bigint, circuit: Num2Bits) {
  const real_result = [];
  let inp_clone = input;

  for (var i = 0; i < 5; i++) {
    real_result.push(inp_clone % 2n);
    inp_clone = (inp_clone - (inp_clone % 2n)) / 2n;
  }

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testBits2Num(input: bigint[], circuit: Bits2Num) {
  let real_result = 0n;

  for (var i = 0; i < 5; i++) {
    real_result += 2n ** BigInt(i) * input[i];
  }

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

describe("Num2Bits test", () => {
  const reverter = new Reverter();

  let verifier: Num2BitsGroth16Verifier;
  let circuit: Num2Bits;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("Num2BitsGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("Num2Bits");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0", async () => {
    const proof = await testNum2Bits(0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1", async () => {
    const proof = await testNum2Bits(1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("13", async () => {
    const proof = await testNum2Bits(13n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("31", async () => {
    const proof = await testNum2Bits(31n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Bits2Num test", () => {
  const reverter = new Reverter();

  let verifier: Bits2NumGroth16Verifier;
  let circuit: Bits2Num;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("Bits2NumGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("Bits2Num");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("[0,0,0,0,0]", async () => {
    const proof = await testBits2Num([0n, 0n, 0n, 0n, 0n], circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("[1,0,0,0,0]", async () => {
    const proof = await testBits2Num([1n, 0n, 0n, 0n, 0n], circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("[1,0,1,1,0]", async () => {
    const proof = await testBits2Num([1n, 0n, 1n, 1n, 0n], circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("[1,1,1,1,1]", async () => {
    const proof = await testBits2Num([1n, 1n, 1n, 1n, 1n], circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

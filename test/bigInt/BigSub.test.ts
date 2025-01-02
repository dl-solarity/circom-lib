import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";
import { bigIntToArray } from "../helpers/helperFunctions";

import { BigSub, BigSubNonEqual } from "@/generated-types/zkit";
import { BigSubGroth16Verifier, BigSubNonEqualGroth16Verifier } from "@/generated-types/ethers";

async function testSub(input1: bigint, input2: bigint, circuit: BigSub) {
  const input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  const real_result = bigIntToArray(64, 4, input1 - input2);

  await expect(circuit).with.witnessInputs({ in: input, dummy: 0n }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
    dummy: 0n,
  });

  return proofStruct;
}

async function testBigSubNonEqual(input1: bigint, input2: bigint, circuit: BigSubNonEqual) {
  const input = [bigIntToArray(64, 6, input1), bigIntToArray(64, 4, input2)];

  const real_result = bigIntToArray(64, 6, input1 - input2);

  await expect(circuit)
    .with.witnessInputs({ in1: input[0], in2: input[1], dummy: 0n })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in1: input[0],
    in2: input[1],
    dummy: 0n,
  });

  return proofStruct;
}

describe("Big sub test", () => {
  const reverter = new Reverter();

  let verifier: BigSubGroth16Verifier;
  let circuit: BigSub;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("BigSubGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("BigSub");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);
  it("15 - 15", async () => {
    const proof = await testSub(15n, 15n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("16 - 15", async () => {
    const proof = await testSub(16n, 15n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("6277101735386680763835789423207666416102355444464034512896 - 6277101735386680763835789423207666416102355444464034512895", async () => {
    const proof = await testSub(
      6277101735386680763835789423207666416102355444464034512896n,
      6277101735386680763835789423207666416102355444464034512895n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("115792089237316195423570985008687907853269984665640564039457584007913129639935 - 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testSub(
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Big sub non equal test", () => {
  const reverter = new Reverter();

  let verifier: BigSubNonEqualGroth16Verifier;
  let circuit: BigSubNonEqual;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("BigSubNonEqualGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("BigSubNonEqual");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);
  
  it("15 - 15", async () => {
    const proof = await testBigSubNonEqual(15n, 15n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("16 - 15", async () => {
    const proof = await testBigSubNonEqual(16n, 15n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("6277101735386680763835789423207666416102355444464034512896 - 6277101735386680763835789423207666416102355444464034512895", async () => {
    const proof = await testBigSubNonEqual(
      6277101735386680763835789423207666416102355444464034512896n,
      6277101735386680763835789423207666416102355444464034512895n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("115792089237316195423570985008687907853269984665640564039457584007913129639935 - 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testBigSubNonEqual(
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

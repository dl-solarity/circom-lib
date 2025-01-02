import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";
import { bigIntToArray } from "../helpers/helperFunctions";

import { BigAddGroth16Verifier, BigAddNonEqualGroth16Verifier } from "@/generated-types/ethers";
import { BigAdd, BigAddNonEqual } from "@/generated-types/zkit";

async function testAdding(input1: bigint, input2: bigint, circuit: BigAdd) {
  const input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  const real_result = bigIntToArray(64, 5, input1 + input2);

  await expect(circuit).with.witnessInputs({ in: input, dummy: 0n }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
    dummy: 0n,
  });

  return proofStruct;
}

async function testAddingNonEqual(input1: bigint, input2: bigint, circuit: BigAddNonEqual) {
  const input = [bigIntToArray(64, 6, input1), bigIntToArray(64, 4, input2)];

  const real_result = bigIntToArray(64, 7, input1 + input2);

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

describe("Big add equal addends", () => {
  const reverter = new Reverter();

  let verifier: BigAddGroth16Verifier;
  let circuit: BigAdd;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("BigAddGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("BigAdd");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  //no overflows
  it("15 + 15", async () => {
    const proof = await testAdding(15n, 15n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  //last overflow
  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 + 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testAdding(
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  //all overflows
  it("ff...ff (256 bit) + ff...ff (256 bit)", async () => {
    const proof = await testAdding(
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Big add non equal addends", () => {
  const reverter = new Reverter();

  let verifier: BigAddNonEqualGroth16Verifier;
  let circuit: BigAddNonEqual;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("BigAddNonEqualGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("BigAddNonEqual");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("15 + 15", async () => {
    const proof = await testAddingNonEqual(15n, 15n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933 + 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testAddingNonEqual(
      24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933 + ff...ff (256 bit)", async () => {
    const proof = await testAddingNonEqual(
      24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933n,
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

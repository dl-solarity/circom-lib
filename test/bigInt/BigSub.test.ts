import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";
import { bigIntToArray } from "../helpers/helperFunctions";

import { BigSub } from "@/generated-types/zkit";
import { BigSubGroth16Verifier } from "@/generated-types/ethers";

async function testSub(input1: bigint, input2: bigint, circuit: BigSub) {
  let input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  let real_result = bigIntToArray(64, 4, input1 - input2);

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 4);

  for (var i = 0; i < 4; i++) {
    expect(circuit_result[i]).to.be.eq(
      real_result[i],
      `${input1} - ${input2}: ${circuit_result[i]}, ${real_result[i]}`,
    );
  }

  const proofStruct = await circuit.generateProof({
    in: input,
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

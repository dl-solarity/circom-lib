import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";
import { bigIntToArray, modInverse } from "../helpers/helperFunctions";

import { BigModInvOptimised } from "@/generated-types/zkit";
import { BigModInvOptimisedGroth16Verifier } from "@/generated-types/ethers";

async function testInv(input1: bigint, input2: bigint, circuit: BigModInvOptimised) {
  const input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  const real_result = bigIntToArray(64, 4, modInverse(input1, input2));

  await expect(circuit)
    .with.witnessInputs({ in: input[0], modulus: input[1], dummy: 0n })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input[0],
    modulus: input[1],
    dummy: 0n,
  });

  return proofStruct;
}

describe("Big Inv test", () => {
  const reverter = new Reverter();

  let verifier: BigModInvOptimisedGroth16Verifier;
  let circuit: BigModInvOptimised;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("BigModInvOptimisedGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("BigModInvOptimised");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("1 / 109730872847609188478309451572148122150330802072000585050763249942403213063436 % 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn", async () => {
    const proof = await testInv(
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

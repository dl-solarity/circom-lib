import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";
import { bigIntToArray } from "../helpers/bigIntToArray";

import { BigModInvOptimised } from "@/generated-types/zkit";
import { BigModInvOptimisedGroth16Verifier } from "@/generated-types/ethers";

function modInverse(num: bigint, mod: bigint) {
  let m0 = mod;
  let x0 = 0n;
  let x1 = 1n;

  if (mod === 1n) return 0n;

  while (num > 1n) {
    let q = num / mod;
    let t = mod;

    mod = num % mod;
    num = t;
    t = x0;

    x0 = x1 - q * x0;
    x1 = t;
  }

  if (x1 < 0n) {
    x1 += m0;
  }

  return x1;
}

async function testInv(input1: bigint, input2: bigint, circuit: BigModInvOptimised) {
  let input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  let real_result = bigIntToArray(64, 4, modInverse(input1, input2));

  const w = await circuit.calculateWitness({ in: input[0], modulus: input[1], dummy: 0n });

  let circuit_result = w.slice(1, 1 + 4);

  for (var i = 0; i < 4; i++) {
    expect(circuit_result[i]).to.be.eq(
      real_result[i],
      `1 / ${input1} % ${input2}: ${circuit_result[i]}, ${real_result[i]}`,
    );
  }

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

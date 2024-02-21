// @ts-ignore
import * as snarkjs from "snarkjs";

import { CircomJS } from "@zefi/circomjs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Mul2Verifier } from "../typechain-types";
import { Reverter } from "./helpers/reverter";

import type { Calldata, ProofStruct } from "./helpers/types";

describe("Mul2 test", function () {
  const reverter = new Reverter();
  const circom = new CircomJS();

  const mul2Circuit = circom.getCircuit("mul2");

  let verifier: Mul2Verifier;

  beforeEach(async () => {
    verifier = (await ethers.deployContract("Mul2Verifier")) as Mul2Verifier;

    await reverter.snapshot();
  });

  afterEach(async () => {
    await reverter.revert();
  });

  it("should verify the proof", async function () {
    const input = { a: 3, b: 4 };

    const proofStruct = (await mul2Circuit.genProof(input)) as ProofStruct;

    let calldata = await snarkjs.groth16.exportSolidityCallData(
      proofStruct.proof,
      proofStruct.publicSignals
    );

    calldata = JSON.parse(`[${calldata}]`) as Calldata;
    const [pA, pB, pC, publicSignals] = calldata;

    expect(await verifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
  });
});

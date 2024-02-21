// @ts-ignore
import * as snarkjs from "snarkjs";

import { CircomJS } from "@zefi/circomjs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Sum2Verifier } from "../typechain-types";
import { Reverter } from "./helpers/reverter";

import type { Calldata, ProofStruct } from "./helpers/types";

describe("Sum2 test", function () {
  const reverter = new Reverter();
  const circom = new CircomJS();

  const sum2Circuit = circom.getCircuit("sum2");

  let verifier: Sum2Verifier;

  beforeEach(async () => {
    verifier = (await ethers.deployContract("Sum2Verifier")) as Sum2Verifier;

    await reverter.snapshot();
  });

  afterEach(async () => {
    await reverter.revert();
  });

  it("should verify the proof", async function () {
    const input = { a: 3, b: 4 };

    const proofStruct = (await sum2Circuit.genProof(input)) as ProofStruct;

    let calldata = await snarkjs.groth16.exportSolidityCallData(
      proofStruct.proof,
      proofStruct.publicSignals
    );

    calldata = JSON.parse(`[${calldata}]`) as Calldata;
    const [pA, pB, pC, publicSignals] = calldata;

    expect(await verifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
  });
});

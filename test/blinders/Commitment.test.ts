import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";

import { CommitmentVerifierVerifier } from "@ethers-v6";
import { CommitmentVerifier } from "@zkit";

describe("Commitment", () => {
  const reverter = new Reverter();

  let commitmentVerifier: CommitmentVerifierVerifier;
  let commitmentCircuit: CommitmentVerifier;

  before("setup", async () => {
    const CommitmentMockVerifier = await ethers.getContractFactory("CommitmentVerifierVerifier");

    commitmentVerifier = await CommitmentMockVerifier.deploy();
    commitmentCircuit = await zkit.getCircuit("CommitmentVerifier");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("should return commitment and hash of nullifier", async () => {
    const proofStruct = await commitmentCircuit.generateProof({
      nullifier: 1,
      secret: 2,
    });

    // Poseidon(1, 2)
    expect(proofStruct.publicSignals.commitment).to.equal(
      "7853200120776062878684798364095072458815029376092732009249414926327459813530",
    );
    // Poseidon(1)
    expect(proofStruct.publicSignals.nullifierHash).to.equal(
      "18586133768512220936620570745912940619677854269274689475585506675881198879027",
    );

    const [pA, pB, pC, publicSignals] = await commitmentCircuit.generateCalldata(proofStruct);

    expect(await commitmentVerifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
  });
});

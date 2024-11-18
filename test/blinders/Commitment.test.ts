import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";

import { CommitmentVerifierGroth16Verifier } from "@ethers-v6";
import { CommitmentVerifier } from "@zkit";

describe("Commitment", () => {
  const reverter = new Reverter();

  let commitmentVerifier: CommitmentVerifierGroth16Verifier;
  let commitmentCircuit: CommitmentVerifier;

  before("setup", async () => {
    const CommitmentMockVerifier = await ethers.getContractFactory("CommitmentVerifierGroth16Verifier");

    commitmentVerifier = await CommitmentMockVerifier.deploy();
    commitmentCircuit = await zkit.getCircuit("CommitmentVerifier");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("should return commitment and hash of nullifier", async () => {
    await expect(commitmentCircuit)
      .with.witnessInputs({
        nullifier: 1,
        secret: 2,
      })
      .to.have.witnessOutputs({
        commitment: "7853200120776062878684798364095072458815029376092732009249414926327459813530",
        nullifierHash: "18586133768512220936620570745912940619677854269274689475585506675881198879027",
      });

    const proofStruct = await commitmentCircuit.generateProof({
      nullifier: 1,
      secret: 2,
    });

    await expect(commitmentCircuit).to.useSolidityVerifier(commitmentVerifier).and.verifyProof(proofStruct);
  });
});

import { CircomJS } from "@zefi/circomjs";
import { expect } from "chai";
import { ethers } from "hardhat";

import { Reverter } from "../helpers/reverter";
import { generateCalldata } from "../helpers/zk-helper";

import { CommitmentMockVerifier } from "@ethers-v6";

describe("Commitment", () => {
  const reverter = new Reverter();
  const circom = new CircomJS();

  const commitmentCircuit = circom.getCircuit("CommitmentMock");

  let commitmentVerifier: CommitmentMockVerifier;

  before("setup", async () => {
    const CommitmentMockVerifier = await ethers.getContractFactory("CommitmentMockVerifier");

    commitmentVerifier = await CommitmentMockVerifier.deploy();

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("should return commitment and hash of nullifier", async () => {
    const proofStruct = await commitmentCircuit.genProof({
      nullifier: 1,
      secret: 2,
    });

    // Poseidon(1, 2)
    expect(proofStruct.publicSignals[0]).to.equal(
      "7853200120776062878684798364095072458815029376092732009249414926327459813530",
    );
    // Poseidon(1)
    expect(proofStruct.publicSignals[1]).to.equal(
      "18586133768512220936620570745912940619677854269274689475585506675881198879027",
    );

    const [pA, pB, pC, publicSignals] = await generateCalldata(proofStruct);

    expect(await commitmentVerifier.verifyProof(pA, pB, pC, publicSignals as any)).to.be.true;
  });
});

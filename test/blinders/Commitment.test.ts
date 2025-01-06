import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";

import { CommitmentGroth16Verifier } from "@ethers-v6";
import { Commitment } from "@zkit";

describe("Commitment", () => {
  const reverter = new Reverter();

  let verifier: CommitmentGroth16Verifier;
  let circuit: Commitment;

  before("setup", async () => {
    const CommitmentMock = await ethers.getContractFactory("CommitmentGroth16Verifier");

    verifier = await CommitmentMock.deploy();
    circuit = await zkit.getCircuit("Commitment");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("should return verifier and hash of nullifier", async () => {
    await expect(circuit)
      .with.witnessInputs({
        nullifier: 1,
        secret: 2,
        dummy: 0,
      })
      .to.have.witnessOutputs({
        commitment: "7853200120776062878684798364095072458815029376092732009249414926327459813530",
        nullifierHash: "18586133768512220936620570745912940619677854269274689475585506675881198879027",
      });

    const proofStruct = await circuit.generateProof({
      nullifier: 1,
      secret: 2,
      dummy: 0,
    });

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proofStruct);
  });
});

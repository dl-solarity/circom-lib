import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { CircomJS } from "@zefi/circomjs";
import { ethers } from "hardhat";
import { expect } from "chai";

import { deployPoseidonFacade } from "./helpers/poseidon/poseidon-deployer";
import { Reverter } from "./helpers/reverter";
import { ProofStruct } from "./helpers/types";
import { generateCalldata } from "./helpers/zk-helper";

import { SmtMock, SmtVerifier } from "@ethers-v6";

describe("SMT", () => {
  const reverter = new Reverter();
  const circom = new CircomJS();

  const smtCircuit = circom.getCircuit("Smt");

  let smtChecker: SmtMock;
  let smtVerifier: SmtVerifier;
  let owner: SignerWithAddress;

  before("setup", async () => {
    [owner] = await ethers.getSigners();

    const poseidonFacade = await deployPoseidonFacade();
    const SmtMock = await ethers.getContractFactory("SmtMock", {
      libraries: {
        PoseidonFacade: poseidonFacade,
      },
    });

    smtVerifier = await ethers.deployContract("SmtVerifier");
    smtChecker = await SmtMock.deploy();

    await reverter.snapshot();
  });

  afterEach(async () => {
    await reverter.revert();
  });

  it("should prove the tree", async () => {
    let leaves: string[] = [];

    for (let i = 0; i < 10; i++) {
      const rand = ethers.hexlify(ethers.randomBytes(30));

      await smtChecker.addElement(rand, rand);

      leaves.push(rand);
    }

    const merkleProof = await smtChecker.getProof(leaves[5]);

    let proofStruct = (await smtCircuit.genProof({
      root: merkleProof.root,
      siblings: merkleProof.siblings,
      key: merkleProof.key,
      value: merkleProof.value,
    })) as ProofStruct;

    const [pA, pB, pC, publicSignals] = await generateCalldata(proofStruct);

    expect(await smtVerifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
  });
});

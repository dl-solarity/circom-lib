import { expect } from "chai";

import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { CircomJS } from "@zefi/circomjs";
import { ethers } from "hardhat";
import { deployPoseidonFacade } from "./helpers/poseidon/poseidon-deployer";
import { Reverter } from "./helpers/reverter";

import { SmtMock, SmtMock__factory, SmtVerifier } from "../typechain-types";

import { ProofStruct } from "./helpers/types";
import { generateCallData } from "./helpers/zkHelper";

describe("SMT test", () => {
  const reverter = new Reverter();
  const circom = new CircomJS();

  const smtCircuit = circom.getCircuit("smt");

  let smtChecker: SmtMock;
  let smtVerifier: SmtVerifier;
  let owner: SignerWithAddress;

  before("setup", async () => {
    [owner] = await ethers.getSigners();

    const poseidonFacade = await deployPoseidonFacade();

    smtVerifier = await ethers.deployContract("SmtVerifier");

    const SMTChecker = new SmtMock__factory({
      ["@iden3/contracts/lib/Poseidon.sol:PoseidonFacade"]:
        await poseidonFacade.getAddress(),
    });

    smtChecker = await SMTChecker.connect(owner).deploy();

    reverter.snapshot();
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

    const [pA, pB, pC, publicSignals] = await generateCallData(proofStruct);

    expect(await smtVerifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
  });
});

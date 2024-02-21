// @ts-ignore
import * as snarkjs from "snarkjs";

import { expect } from "chai";

import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { CircomJS } from "@zefi/circomjs";
import { ethers } from "hardhat";
import { deployPoseidonFacade } from "./helpers/poseidon/poseidon-deployer";
import { Reverter } from "./helpers/reverter";

import {
  SmtChecker,
  SmtChecker__factory,
  SmtVerifier,
} from "../typechain-types";

import { Calldata, ProofStruct } from "./helpers/types";

describe("SMT test", () => {
  const reverter = new Reverter();
  const circom = new CircomJS();

  const smtCircuit = circom.getCircuit("smt");

  let smtChecker: SmtChecker;
  let smtVerifier: SmtVerifier;
  let owner: SignerWithAddress;

  beforeEach("setup", async () => {
    [owner] = await ethers.getSigners();

    const poseidonFacade = await deployPoseidonFacade();

    smtVerifier = await ethers.deployContract("SmtVerifier");

    const SMTChecker = new SmtChecker__factory({
      ["@iden3/contracts/lib/Poseidon.sol:PoseidonFacade"]:
        await poseidonFacade.getAddress(),
    });

    smtChecker = await SMTChecker.connect(owner).deploy(
      await smtVerifier.getAddress()
    );

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

    const root = await smtChecker.getRoot();
    const merkleProof = await smtChecker.getProof(leaves[5]);

    let proofStruct = (await smtCircuit.genProof({
      root: merkleProof.root,
      siblings: merkleProof.siblings,
      key: merkleProof.index,
      value: merkleProof.value,
    })) as ProofStruct;

    let calldata = await snarkjs.groth16.exportSolidityCallData(
      proofStruct.proof,
      proofStruct.publicSignals
    );

    calldata = JSON.parse(`[${calldata}]`) as Calldata;
    const [pA, pB, pC, publicSignals] = calldata;

    expect(await smtChecker.verifyProof(root, { a: pA, b: pB, c: pC })).to.be
      .true;

    expect(await smtVerifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
  });
});

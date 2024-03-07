import { CircomJS } from "@zefi/circomjs";
import { expect } from "chai";
import { ethers } from "hardhat";

import { deployPoseidonFacade } from "./helpers/poseidon/poseidon-deployer";
import { Reverter } from "./helpers/reverter";
import { ProofStruct } from "./helpers/types";
import { generateCalldata } from "./helpers/zk-helper";

import { SmtMock, SmtMockVerifier } from "@ethers-v6";

describe("SMT", () => {
  const reverter = new Reverter();
  const circom = new CircomJS();

  const smtCircuit = circom.getCircuit("SmtMock");

  let smtMock: SmtMock;
  let smtVerifier: SmtMockVerifier;

  before("setup", async () => {
    const poseidonFacade = await deployPoseidonFacade();
    const SmtMock = await ethers.getContractFactory("SmtMock", {
      libraries: {
        PoseidonFacade: poseidonFacade,
      },
    });

    smtVerifier = await ethers.deployContract("SmtMockVerifier");
    smtMock = await SmtMock.deploy();

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("should prove the tree inclusion", async () => {
    let leaves: string[] = [];

    for (let i = 0; i < 10; i++) {
      const rand = ethers.hexlify(ethers.randomBytes(30));

      await smtMock.addElement(rand, rand);

      leaves.push(rand);
    }

    const merkleProof = await smtMock.getProof(leaves[5]);

    const proofStruct = (await smtCircuit.genProof({
      root: merkleProof.root,
      siblings: merkleProof.siblings,
      key: merkleProof.key,
      value: merkleProof.value,
      auxKey: 0,
      auxValue: 0,
      auxIsEmpty: 0,
      isExclusion: 0,
    })) as ProofStruct;

    const [pA, pB, pC, publicSignals] = await generateCalldata(proofStruct);

    expect(await smtVerifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
  });

  it("should prove the tree inclusion for bamboo", async () => {
    let leaves: string[] = [];

    for (let i = 0; i < 9; i++) {
      const rand = parseInt("1".repeat(i + 1), 2).toString();

      await smtMock.addElement(rand, rand);

      leaves.push(rand);
    }

    const merkleProof = await smtMock.getProof(leaves[8]);

    const proofStruct = (await smtCircuit.genProof({
      root: merkleProof.root,
      siblings: merkleProof.siblings,
      key: merkleProof.key,
      value: merkleProof.value,
      auxKey: 0,
      auxValue: 0,
      auxIsEmpty: 0,
      isExclusion: 0,
    })) as ProofStruct;

    const [pA, pB, pC, publicSignals] = await generateCalldata(proofStruct);

    expect(await smtVerifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
  });

  it("should prove the tree inclusion for max depth", async () => {
    await smtMock.addElement(255, 255);
    await smtMock.addElement(511, 511);

    const merkleProof = await smtMock.getProof(511);

    const proofStruct = (await smtCircuit.genProof({
      root: merkleProof.root,
      siblings: merkleProof.siblings,
      key: merkleProof.key,
      value: merkleProof.value,
      auxKey: 0,
      auxValue: 0,
      auxIsEmpty: 0,
      isExclusion: 0,
    })) as ProofStruct;

    const [pA, pB, pC, publicSignals] = await generateCalldata(proofStruct);

    expect(await smtVerifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
  });

  it("should prove the tree exclusion", async () => {
    for (let i = 0; i < 10; i++) {
      const rand = ethers.hexlify(ethers.randomBytes(30));

      await smtMock.addElement(rand, rand);
    }

    const nonExistentLeaf = ethers.hexlify(ethers.randomBytes(30));

    const merkleProof = await smtMock.getProof(nonExistentLeaf);

    const auxIsEmpty = merkleProof.auxKey ? 0 : 1;

    const proofStruct = (await smtCircuit.genProof({
      root: merkleProof.root,
      siblings: merkleProof.siblings,
      key: merkleProof.key,
      value: 0,
      auxKey: merkleProof.auxKey,
      auxValue: merkleProof.auxValue,
      auxIsEmpty: auxIsEmpty,
      isExclusion: 1,
    })) as ProofStruct;

    const [pA, pB, pC, publicSignals] = await generateCalldata(proofStruct);

    expect(await smtVerifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
  });

  context("when data is incorrect", () => {
    let _console = console;

    beforeEach(() => {
      console = {} as any;
    });

    afterEach(() => {
      console = _console;
    });

    it("should revert an incorrect tree inclusion", async () => {
      let leaves: string[] = [];

      for (let i = 0; i < 10; i++) {
        const rand = ethers.hexlify(ethers.randomBytes(30));

        await smtMock.addElement(rand, rand);

        leaves.push(rand);
      }

      const merkleProof = await smtMock.getProof(leaves[5]);

      const incorrectValue = merkleProof.value + 1n;

      await expect(
        smtCircuit.genProof({
          root: merkleProof.root,
          siblings: merkleProof.siblings,
          key: merkleProof.key,
          value: incorrectValue,
          auxKey: 0,
          auxValue: 0,
          auxIsEmpty: 0,
          isExclusion: 0,
        }),
      ).to.be.rejected;
    });

    it("should revert an incorrect tree exclusion", async () => {
      for (let i = 0; i < 10; i++) {
        const rand = ethers.hexlify(ethers.randomBytes(30));

        await smtMock.addElement(rand, rand);
      }

      const nonExistentLeaf = ethers.hexlify(ethers.randomBytes(30));

      const merkleProof = await smtMock.getProof(nonExistentLeaf);

      const auxIsEmpty = merkleProof.auxKey ? 0 : 1;

      const incorrectValue = merkleProof.auxValue + 1n;

      await expect(
        smtCircuit.genProof({
          root: merkleProof.root,
          siblings: merkleProof.siblings,
          key: merkleProof.key,
          value: 0,
          auxKey: merkleProof.auxKey,
          auxValue: incorrectValue,
          auxIsEmpty: auxIsEmpty,
          isExclusion: 1,
        }),
      ).to.be.rejected;
    });
  });
});

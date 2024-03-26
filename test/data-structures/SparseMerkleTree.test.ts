import { CircomJS } from "@zefi/circomjs";
import { expect } from "chai";
import { ethers } from "hardhat";

import { deployPoseidonFacade } from "../helpers/poseidon/poseidon-deployer";
import { Reverter } from "../helpers/reverter";
import { ProofStruct } from "../helpers/types";
import { generateCalldata } from "../helpers/zk-helper";

import { SparseMerkleTreeMock, SparseMerkleTreeMockVerifier } from "@ethers-v6";

describe("SparseMerkleTree", () => {
  const reverter = new Reverter();
  const circom = new CircomJS();

  const smtCircuit = circom.getCircuit("SparseMerkleTreeMock");

  let smtMock: SparseMerkleTreeMock;
  let smtVerifier: SparseMerkleTreeMockVerifier;

  const leaves: string[] = [];
  let nonExistentLeaf: string;

  before("setup", async () => {
    const poseidonFacade = await deployPoseidonFacade();

    const SparseMerkleTreeMockVerifier = await ethers.getContractFactory("SparseMerkleTreeMockVerifier");
    const SparseMerkleTreeMock = await ethers.getContractFactory("SparseMerkleTreeMock", {
      libraries: {
        PoseidonFacade: poseidonFacade,
      },
    });

    smtVerifier = await SparseMerkleTreeMockVerifier.deploy();
    smtMock = await SparseMerkleTreeMock.deploy();

    for (let i = 0; i < 10; i++) {
      let rand: string;
      do {
        rand = ethers.hexlify(ethers.randomBytes(1));
      } while (leaves.includes(rand));
      leaves.push(rand);
    }

    nonExistentLeaf = leaves[9];

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("should prove the tree inclusion", async () => {
    for (let i = 0; i < 9; i++) {
      await smtMock.addElement(leaves[i], leaves[i]);
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

  it("should prove the tree inclusion for each depth of bamboo", async () => {
    for (let i = 0; i < 9; i++) {
      const rand = parseInt("1".repeat(i + 1), 2).toString();

      await smtMock.addElement(rand, rand);

      const merkleProof = await smtMock.getProof(rand);

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
    }
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
    for (let i = 0; i < 9; i++) {
      await smtMock.addElement(leaves[i], leaves[i]);
    }

    const merkleProof = await smtMock.getProof(nonExistentLeaf);

    const auxIsEmpty = BigInt(merkleProof.auxKey) == 0n ? 1 : 0;

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

  it("should prove the tree exclusion for each depth of bamboo", async () => {
    for (let i = 0; i < 9; i++) {
      const rand = parseInt("1".repeat(i + 1), 2).toString();

      await smtMock.addElement(rand, rand);

      const merkleProof = await smtMock.getProof(nonExistentLeaf);

      const auxIsEmpty = BigInt(merkleProof.auxKey) == 0n ? 1 : 0;

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
    }
  });

  it("should prove the tree exclusion for empty tree", async () => {
    const nonExistentLeaf = ethers.hexlify(ethers.randomBytes(1));

    const merkleProof = await smtMock.getProof(nonExistentLeaf);

    const proofStruct = (await smtCircuit.genProof({
      root: merkleProof.root,
      siblings: merkleProof.siblings,
      key: merkleProof.key,
      value: 0,
      auxKey: merkleProof.auxKey,
      auxValue: merkleProof.auxValue,
      auxIsEmpty: 1,
      isExclusion: 1,
    })) as ProofStruct;

    const [pA, pB, pC, publicSignals] = await generateCalldata(proofStruct);

    expect(await smtVerifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
  });

  describe("when data is incorrect", () => {
    let _console = console;

    beforeEach(() => {
      console = {} as any;
    });

    afterEach(() => {
      console = _console;
    });

    it("should revert an incorrect tree inclusion", async () => {
      for (let i = 0; i < 9; i++) {
        await smtMock.addElement(leaves[i], leaves[i]);
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
      for (let i = 0; i < 9; i++) {
        await smtMock.addElement(leaves[i], leaves[i]);
      }

      const merkleProof = await smtMock.getProof(nonExistentLeaf);

      let auxIsEmpty = BigInt(merkleProof.auxKey) == 0n ? 1 : 0;

      auxIsEmpty = auxIsEmpty == 0 ? 1 : 0;

      await expect(
        smtCircuit.genProof({
          root: merkleProof.root,
          siblings: merkleProof.siblings,
          key: merkleProof.key,
          value: 0,
          auxKey: merkleProof.auxKey,
          auxValue: merkleProof.auxValue,
          auxIsEmpty: auxIsEmpty,
          isExclusion: 1,
        }),
      ).to.be.rejected;
    });
  });
});

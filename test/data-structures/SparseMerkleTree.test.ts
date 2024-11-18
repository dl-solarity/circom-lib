import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { deployPoseidonFacade } from "../helpers/poseidon/poseidon-deployer";
import { Reverter } from "../helpers/reverter";

import { SparseMerkleTreeMock, SparseMerkleTreeVerifierGroth16Verifier } from "@ethers-v6";
import { SparseMerkleTreeVerifier } from "@zkit";

describe("SparseMerkleTree", () => {
  const reverter = new Reverter();

  let smtCircuit: SparseMerkleTreeVerifier;

  let smtMock: SparseMerkleTreeMock;
  let smtVerifier: SparseMerkleTreeVerifierGroth16Verifier;

  const leaves: string[] = [];
  let nonExistentLeaf: string;

  before("setup", async () => {
    const poseidonFacade = await deployPoseidonFacade();

    const SparseMerkleTreeMockVerifier = await ethers.getContractFactory("SparseMerkleTreeVerifierGroth16Verifier");
    const SparseMerkleTreeMock = await ethers.getContractFactory("SparseMerkleTreeMock", {
      libraries: {
        PoseidonFacade: poseidonFacade,
      },
    });

    smtVerifier = await SparseMerkleTreeMockVerifier.deploy();
    smtMock = await SparseMerkleTreeMock.deploy();

    smtCircuit = await zkit.getCircuit("SparseMerkleTreeVerifier");

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
      await smtMock.addElement(ethers.toBeHex(leaves[i], 32), leaves[i]);
    }

    const merkleProof = await smtMock.getProof(ethers.toBeHex(leaves[5], 32));

    const proofStruct = await smtCircuit.generateProof({
      root: BigInt(merkleProof.root),
      siblings: merkleProof.siblings.map((e) => BigInt(e)),
      key: BigInt(merkleProof.key),
      value: BigInt(merkleProof.value),
      auxKey: 0,
      auxValue: 0,
      auxIsEmpty: 0,
      isExclusion: 0,
    });

    const [pA, pB, pC, publicSignals] = await smtCircuit.generateCalldata(proofStruct);

    expect(await smtVerifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
  });

  it("should prove the tree inclusion for each depth of bamboo", async () => {
    for (let i = 0; i < 9; i++) {
      const rand = parseInt("1".repeat(i + 1), 2).toString();

      await smtMock.addElement(ethers.toBeHex(rand, 32), rand);

      const merkleProof = await smtMock.getProof(ethers.toBeHex(rand, 32));

      const proofStruct = await smtCircuit.generateProof({
        root: BigInt(merkleProof.root),
        siblings: merkleProof.siblings.map((e) => BigInt(e)),
        key: BigInt(merkleProof.key),
        value: BigInt(merkleProof.value),
        auxKey: 0,
        auxValue: 0,
        auxIsEmpty: 0,
        isExclusion: 0,
      });

      const [pA, pB, pC, publicSignals] = await smtCircuit.generateCalldata(proofStruct);

      expect(await smtVerifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
    }
  });

  it("should prove the tree inclusion for max depth", async () => {
    await smtMock.addElement(ethers.toBeHex(255, 32), 255);
    await smtMock.addElement(ethers.toBeHex(511, 32), 511);

    const merkleProof = await smtMock.getProof(ethers.toBeHex(511, 32));

    const proofStruct = await smtCircuit.generateProof({
      root: BigInt(merkleProof.root),
      siblings: merkleProof.siblings.map((e) => BigInt(e)),
      key: BigInt(merkleProof.key),
      value: BigInt(merkleProof.value),
      auxKey: 0,
      auxValue: 0,
      auxIsEmpty: 0,
      isExclusion: 0,
    });

    const [pA, pB, pC, publicSignals] = await smtCircuit.generateCalldata(proofStruct);

    expect(await smtVerifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
  });

  it("should prove the tree exclusion", async () => {
    for (let i = 0; i < 9; i++) {
      await smtMock.addElement(ethers.toBeHex(leaves[i], 32), leaves[i]);
    }

    const merkleProof = await smtMock.getProof(ethers.toBeHex(nonExistentLeaf, 32));

    const auxIsEmpty = BigInt(merkleProof.auxKey) == 0n ? 1 : 0;

    const proofStruct = await smtCircuit.generateProof({
      root: BigInt(merkleProof.root),
      siblings: merkleProof.siblings.map((e) => BigInt(e)),
      key: BigInt(merkleProof.key),
      value: 0,
      auxKey: BigInt(merkleProof.auxKey),
      auxValue: BigInt(merkleProof.auxValue),
      auxIsEmpty: auxIsEmpty,
      isExclusion: 1,
    });

    const [pA, pB, pC, publicSignals] = await smtCircuit.generateCalldata(proofStruct);

    expect(await smtVerifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
  });

  it("should prove the tree exclusion for each depth of bamboo", async () => {
    for (let i = 0; i < 9; i++) {
      const rand = parseInt("1".repeat(i + 1), 2).toString();

      await smtMock.addElement(ethers.toBeHex(rand, 32), rand);

      const merkleProof = await smtMock.getProof(ethers.toBeHex(nonExistentLeaf, 32));

      const auxIsEmpty = BigInt(merkleProof.auxKey) == 0n ? 1 : 0;

      const proofStruct = await smtCircuit.generateProof({
        root: BigInt(merkleProof.root),
        siblings: merkleProof.siblings.map((e) => BigInt(e)),
        key: BigInt(merkleProof.key),
        value: 0,
        auxKey: BigInt(merkleProof.auxKey),
        auxValue: BigInt(merkleProof.auxValue),
        auxIsEmpty: auxIsEmpty,
        isExclusion: 1,
      });

      const [pA, pB, pC, publicSignals] = await smtCircuit.generateCalldata(proofStruct);

      expect(await smtVerifier.verifyProof(pA, pB, pC, publicSignals)).to.be.true;
    }
  });

  it("should prove the tree exclusion for empty tree", async () => {
    const nonExistentLeaf = ethers.hexlify(ethers.randomBytes(1));

    const merkleProof = await smtMock.getProof(ethers.toBeHex(nonExistentLeaf, 32));

    const proofStruct = await smtCircuit.generateProof({
      root: BigInt(merkleProof.root),
      siblings: merkleProof.siblings.map((e) => BigInt(e)),
      key: BigInt(merkleProof.key),
      value: 0,
      auxKey: BigInt(merkleProof.auxKey),
      auxValue: BigInt(merkleProof.auxValue),
      auxIsEmpty: 1,
      isExclusion: 1,
    });

    const [pA, pB, pC, publicSignals] = await smtCircuit.generateCalldata(proofStruct);

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
        await smtMock.addElement(ethers.toBeHex(leaves[i], 32), leaves[i]);
      }

      const merkleProof = await smtMock.getProof(ethers.toBeHex(leaves[5], 32));

      const incorrectValue = merkleProof.value + 1n;

      await expect(
        smtCircuit.generateProof({
          root: BigInt(merkleProof.root),
          siblings: merkleProof.siblings.map((e) => BigInt(e)),
          key: BigInt(merkleProof.key),
          value: BigInt(incorrectValue),
          auxKey: 0,
          auxValue: 0,
          auxIsEmpty: 0,
          isExclusion: 0,
        }),
      ).to.be.rejected;
    });

    it("should revert an incorrect tree exclusion", async () => {
      for (let i = 0; i < 9; i++) {
        await smtMock.addElement(ethers.toBeHex(leaves[i], 32), leaves[i]);
      }

      const merkleProof = await smtMock.getProof(ethers.toBeHex(nonExistentLeaf, 32));

      let auxIsEmpty = BigInt(merkleProof.auxKey) == 0n ? 1 : 0;

      auxIsEmpty = auxIsEmpty == 0 ? 1 : 0;

      await expect(
        smtCircuit.generateProof({
          root: BigInt(merkleProof.root),
          siblings: merkleProof.siblings.map((e) => BigInt(e)),
          key: BigInt(merkleProof.key),
          value: 0,
          auxKey: BigInt(merkleProof.auxKey),
          auxValue: BigInt(merkleProof.auxValue),
          auxIsEmpty: auxIsEmpty,
          isExclusion: 1,
        }),
      ).to.be.rejected;
    });
  });
});

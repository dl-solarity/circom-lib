import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";
import { poseidonHash, getBytes32PoseidonHash } from "../helpers/poseidon/poseidon-hash";
import { buildFullTree, getPositionalProof, getRoot } from "../helpers/imt-helper";

import { IncrementalMerkleTree } from "@zkit";
import { IncrementalMerkleTreeGroth16Verifier } from "@/generated-types/ethers";

function arrayToBinaryNumber(arr: number[]) {
  let binaryStr = "";

  for (let i = 0; i < arr.length; i++) {
    binaryStr += arr[i].toString();
  }

  return parseInt(binaryStr, 2);
}

describe("IncrementalMerkleTree", () => {
  const reverter = new Reverter();

  let circuit: IncrementalMerkleTree;
  let verifier: IncrementalMerkleTreeGroth16Verifier;

  const treeHeight = 10;

  before("setup", async () => {
    const IncrementalMerkleTreeMockVerifier = await ethers.getContractFactory("IncrementalMerkleTreeGroth16Verifier");

    verifier = await IncrementalMerkleTreeMockVerifier.deploy();
    circuit = await zkit.getCircuit("IncrementalMerkleTree");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("should prove the tree inclusion", async () => {
    let leaves: string[] = [];

    for (let i = 0; i < 10; i++) {
      const rand = ethers.hexlify(ethers.randomBytes(30));

      leaves.push(getBytes32PoseidonHash(rand));
    }

    const tsTree = buildFullTree(poseidonHash, leaves, treeHeight);
    const leaf = leaves[9];

    const [pathIndices, pathElements] = getPositionalProof(tsTree, leaf);

    const proofStruct = await circuit.generateProof({
      leaf: BigInt(leaf),
      directionBits: arrayToBinaryNumber(pathIndices),
      branches: pathElements.map((e) => BigInt(e)),
      root: BigInt(getRoot(tsTree)),
      dummy: 0,
    });

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proofStruct);
  });

  it("should prove the tree inclusion for each depth of bamboo", async () => {
    let leaves: string[] = [];

    for (let i = 0; i < 30; i++) {
      const leaf = getBytes32PoseidonHash(ethers.hexlify(ethers.randomBytes(30)));

      leaves.push(leaf);

      const tsTree = buildFullTree(poseidonHash, leaves, treeHeight);

      const [pathIndices, pathElements] = getPositionalProof(tsTree, leaf);

      const proofStruct = await circuit.generateProof({
        leaf: BigInt(leaf),
        directionBits: arrayToBinaryNumber(pathIndices),
        branches: pathElements.map((e) => BigInt(e)),
        root: BigInt(getRoot(tsTree)),
        dummy: 0,
      });

      await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proofStruct);
    }
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
      let leaves: string[] = [];

      for (let i = 0; i < 9; i++) {
        const rand = ethers.hexlify(ethers.randomBytes(30));

        leaves.push(getBytes32PoseidonHash(rand));
      }

      const tsTree = buildFullTree(poseidonHash, leaves, treeHeight);

      const someLeaf = leaves[0];
      const anotherLeaf = leaves[1];

      const [pathIndices, pathElements] = getPositionalProof(tsTree, someLeaf);

      await expect(circuit).to.not.generateProof({
        leaf: BigInt(anotherLeaf),
        directionBits: arrayToBinaryNumber(pathIndices),
        branches: pathElements.map((e) => BigInt(e)),
        root: BigInt(getRoot(tsTree)),
        dummy: 0,
      });
    });

    it("should revert with incorrect direction path", async () => {
      let leaves: string[] = [];

      for (let i = 0; i < 9; i++) {
        const rand = ethers.hexlify(ethers.randomBytes(30));

        leaves.push(getBytes32PoseidonHash(rand));
      }

      const tsTree = buildFullTree(poseidonHash, leaves, treeHeight);
      const leaf = leaves[0];

      const [pathIndices, pathElements] = getPositionalProof(tsTree, leaves[0]);
      const incorrectPath = pathIndices.map((e) => 1 - e);

      await expect(circuit).to.not.generateProof({
        leaf: BigInt(leaf),
        directionBits: arrayToBinaryNumber(incorrectPath),
        branches: pathElements.map((e) => BigInt(e)),
        root: BigInt(getRoot(tsTree)),
        dummy: 0,
      });
    });

    it("should revert with incorrect branches", async () => {
      let leaves: string[] = [];

      for (let i = 0; i < 9; i++) {
        const rand = ethers.hexlify(ethers.randomBytes(30));

        leaves.push(getBytes32PoseidonHash(rand));
      }

      const tsTree = buildFullTree(poseidonHash, leaves, treeHeight);
      const leaf = leaves[0];

      const [pathIndices, pathElements] = getPositionalProof(tsTree, leaves[0]);

      pathElements[0] = ethers.hexlify(ethers.randomBytes(30));

      await expect(circuit).to.not.generateProof({
        leaf: BigInt(leaf),
        directionBits: arrayToBinaryNumber(pathIndices),
        branches: pathElements.map((e) => BigInt(e)),
        root: BigInt(getRoot(tsTree)),
        dummy: 0,
      });
    });
  });
});

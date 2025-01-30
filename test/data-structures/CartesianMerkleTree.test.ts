import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { deployPoseidonFacade } from "../helpers/poseidon/poseidon-deployer";
import { Reverter } from "../helpers/reverter";

import { CartesianMerkleTreeGroth16Verifier, CartesianMerkleTreeMock } from "@ethers-v6";
import { CartesianMerkleTree } from "@zkit";

function parseNumberToBitsArray(num: bigint, expectedPathLen: bigint, desiredProofSize: number): number[] {
  const binary = num.toString(2);

  // circuit expects directionBits to be the length of desiredProofSize/2
  let resultArr = Array<number>(desiredProofSize / 2).fill(0);

  let j = 0;
  // expectedPathLen is needed because a path may have leading zeroes,
  // whereas the number derived from binary doesn't
  for (let i = Math.abs(Number(expectedPathLen) - binary.length); i < Number(expectedPathLen); i++) {
    resultArr[i] = Number(binary[j]);

    j++;
  }

  return resultArr;
}

function numberToArray(merkleProof: any, desiredProofSize: number) {
  let siblingsLength = Array<number>(desiredProofSize / 2).fill(0);

  for (let i = 0; i < merkleProof.siblingsLength / 2n; i++) {
    siblingsLength[i] = 1;
  }

  return siblingsLength;
}

describe("CartesianMerkleTree", () => {
  const reverter = new Reverter();

  let circuit: CartesianMerkleTree;

  let cmtMock: CartesianMerkleTreeMock;
  let verifier: CartesianMerkleTreeGroth16Verifier;

  const leaves: string[] = ["0xe5", "0xc8", "0xec", "0x9b", "0x23", "0xf6", "0x6d", "0x9e", "0x72", "0x64"];

  const nonExistentLeaf = leaves[9];
  const desiredProofSize = 10;

  before("setup", async () => {
    const poseidonFacade = await deployPoseidonFacade();

    const CartesianMerkleTreeMockVerifier = await ethers.getContractFactory("CartesianMerkleTreeGroth16Verifier");
    const CartesianMerkleTreeMock = await ethers.getContractFactory("CartesianMerkleTreeMock", {
      libraries: {
        PoseidonFacade: poseidonFacade,
      },
    });

    verifier = await CartesianMerkleTreeMockVerifier.deploy();
    cmtMock = await CartesianMerkleTreeMock.deploy();

    circuit = await zkit.getCircuit("CartesianMerkleTree");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("should prove the tree inclusion", async () => {
    for (let i = 0; i < 9; i++) {
      await cmtMock.addElement(leaves[i]);
    }

    const merkleProof = await cmtMock.getProof(leaves[5], desiredProofSize);

    const directionBits = parseNumberToBitsArray(
      merkleProof.directionBits,
      merkleProof.siblingsLength / 2n,
      desiredProofSize,
    );
    const siblingsLength = numberToArray(merkleProof, desiredProofSize);

    const proofStruct = await circuit.generateProof({
      root: BigInt(merkleProof.root),
      siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
      siblingsLength: siblingsLength,
      directionBits: directionBits,
      key: BigInt(merkleProof.key),
      nonExistenceKey: BigInt(merkleProof.nonExistenceKey),
      isExclusion: merkleProof.existence ? 0 : 1,
      dummy: 0,
    });

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proofStruct);
  });

  it("should prove the tree inclusion for each depth of bamboo", async () => {
    for (let i = 0; i < 9; i++) {
      const rand = parseInt("1".repeat(i + 1), 2).toString();

      await cmtMock.addElement(rand);

      const merkleProof = await cmtMock.getProof(rand, desiredProofSize);

      const directionBits = parseNumberToBitsArray(
        merkleProof.directionBits,
        merkleProof.siblingsLength / 2n,
        desiredProofSize,
      );
      const siblingsLength = numberToArray(merkleProof, desiredProofSize);

      const proofStruct = await circuit.generateProof({
        root: BigInt(merkleProof.root),
        siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
        siblingsLength: siblingsLength,
        directionBits: directionBits,
        key: BigInt(merkleProof.key),
        nonExistenceKey: BigInt(merkleProof.nonExistenceKey),
        isExclusion: merkleProof.existence ? 0 : 1,
        dummy: 0,
      });

      await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proofStruct);
    }
  });

  it("should prove the tree exclusion", async () => {
    for (let i = 0; i < 9; i++) {
      await cmtMock.addElement(leaves[i]);
    }

    const merkleProof = await cmtMock.getProof(nonExistentLeaf, desiredProofSize);

    const directionBits = parseNumberToBitsArray(
      merkleProof.directionBits,
      merkleProof.siblingsLength / 2n,
      desiredProofSize,
    );
    const siblingsLength = numberToArray(merkleProof, desiredProofSize);

    const proofStruct = await circuit.generateProof({
      root: BigInt(merkleProof.root),
      siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
      siblingsLength: siblingsLength,
      directionBits: directionBits,
      key: BigInt(merkleProof.key),
      nonExistenceKey: BigInt(merkleProof.nonExistenceKey),
      isExclusion: merkleProof.existence ? 0 : 1,
      dummy: 0,
    });

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proofStruct);
  });

  it("should prove the tree exclusion for each depth of bamboo", async () => {
    for (let i = 0; i < 9; i++) {
      const rand = parseInt("1".repeat(i + 1), 2).toString();

      await cmtMock.addElement(rand);

      const merkleProof = await cmtMock.getProof(nonExistentLeaf, desiredProofSize);

      const directionBits = parseNumberToBitsArray(
        merkleProof.directionBits,
        merkleProof.siblingsLength / 2n,
        desiredProofSize,
      );
      const siblingsLength = numberToArray(merkleProof, desiredProofSize);

      const proofStruct = await circuit.generateProof({
        root: BigInt(merkleProof.root),
        siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
        siblingsLength: siblingsLength,
        directionBits: directionBits,
        key: BigInt(merkleProof.key),
        nonExistenceKey: BigInt(merkleProof.nonExistenceKey),
        isExclusion: merkleProof.existence ? 0 : 1,
        dummy: 0,
      });

      await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proofStruct);
    }
  });

  it("should prove the tree exclusion for empty tree", async () => {
    const merkleProof = await cmtMock.getProof(nonExistentLeaf, desiredProofSize);

    const directionBits = parseNumberToBitsArray(
      merkleProof.directionBits,
      merkleProof.siblingsLength / 2n,
      desiredProofSize,
    );
    const siblingsLength = numberToArray(merkleProof, desiredProofSize);

    const proofStruct = await circuit.generateProof({
      root: BigInt(merkleProof.root),
      siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
      siblingsLength: siblingsLength,
      directionBits: directionBits,
      key: BigInt(merkleProof.key),
      nonExistenceKey: BigInt(merkleProof.nonExistenceKey),
      isExclusion: merkleProof.existence ? 0 : 1,
      dummy: 0,
    });

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proofStruct);
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
        await cmtMock.addElement(leaves[i]);
      }

      const merkleProof = await cmtMock.getProof(leaves[5], desiredProofSize);

      const directionBits = parseNumberToBitsArray(
        merkleProof.directionBits,
        merkleProof.siblingsLength / 2n,
        desiredProofSize,
      );
      const siblingsLength = numberToArray(merkleProof, desiredProofSize);

      const incorrectKey = merkleProof.key + 1n;

      await expect(circuit).to.not.generateProof({
        root: BigInt(merkleProof.root),
        siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
        siblingsLength: siblingsLength,
        directionBits: directionBits,
        key: incorrectKey,
        nonExistenceKey: BigInt(merkleProof.nonExistenceKey),
        isExclusion: 0,
        dummy: 0,
      });
    });

    it("should revert an incorrect tree exclusion", async () => {
      for (let i = 0; i < 9; i++) {
        await cmtMock.addElement(leaves[i]);
      }

      const merkleProof = await cmtMock.getProof(nonExistentLeaf, desiredProofSize);

      const directionBits = parseNumberToBitsArray(
        merkleProof.directionBits,
        merkleProof.siblingsLength / 2n,
        desiredProofSize,
      );
      const siblingsLength = numberToArray(merkleProof, desiredProofSize);

      await expect(circuit).to.not.generateProof({
        root: BigInt(merkleProof.root),
        siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
        siblingsLength: siblingsLength,
        directionBits: directionBits,
        key: BigInt(merkleProof.key),
        nonExistenceKey: 0n,
        isExclusion: 1,
        dummy: 0,
      });
    });

    it("should revert with incorrect direction path", async () => {
      for (let i = 0; i < 9; i++) {
        await cmtMock.addElement(leaves[i]);
      }

      let merkleProof = await cmtMock.getProof(nonExistentLeaf, desiredProofSize);

      let directionBits = parseNumberToBitsArray(
        merkleProof.directionBits,
        merkleProof.siblingsLength / 2n,
        desiredProofSize,
      );
      let siblingsLength = numberToArray(merkleProof, desiredProofSize);

      let wrongPath = directionBits.map((e: number) => 1 - e);

      await expect(circuit).to.not.generateProof({
        root: BigInt(merkleProof.root),
        siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
        siblingsLength: siblingsLength,
        directionBits: wrongPath,
        key: BigInt(merkleProof.key),
        nonExistenceKey: BigInt(merkleProof.nonExistenceKey),
        isExclusion: merkleProof.existence ? 0 : 1,
        dummy: 0,
      });

      merkleProof = await cmtMock.getProof(leaves[2], desiredProofSize);

      directionBits = parseNumberToBitsArray(
        merkleProof.directionBits,
        merkleProof.siblingsLength / 2n,
        desiredProofSize,
      );
      siblingsLength = numberToArray(merkleProof, desiredProofSize);

      wrongPath = directionBits.map((e: number) => 1 - e);

      await expect(circuit).to.not.generateProof({
        root: BigInt(merkleProof.root),
        siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
        siblingsLength: siblingsLength,
        directionBits: wrongPath,
        key: BigInt(merkleProof.key),
        nonExistenceKey: BigInt(merkleProof.nonExistenceKey),
        isExclusion: merkleProof.existence ? 0 : 1,
        dummy: 0,
      });
    });

    it("should revert while checking exclusion with an inclusion proof and vice versa", async () => {
      for (let i = 0; i < 9; i++) {
        await cmtMock.addElement(leaves[i]);
      }

      const inclusionProof = await cmtMock.getProof(leaves[5], desiredProofSize);

      let directionBits = parseNumberToBitsArray(
        inclusionProof.directionBits,
        inclusionProof.siblingsLength / 2n,
        desiredProofSize,
      );
      let siblingsLength = numberToArray(inclusionProof, desiredProofSize);

      await expect(circuit).to.not.generateProof({
        root: BigInt(inclusionProof.root),
        siblings: inclusionProof.siblings.map((e: string) => BigInt(e)),
        siblingsLength: siblingsLength,
        directionBits: directionBits,
        key: inclusionProof.key,
        nonExistenceKey: BigInt(inclusionProof.nonExistenceKey),
        isExclusion: 1,
        dummy: 0,
      });

      const exclusionProof = await cmtMock.getProof(nonExistentLeaf, desiredProofSize);

      directionBits = parseNumberToBitsArray(
        exclusionProof.directionBits,
        exclusionProof.siblingsLength / 2n,
        desiredProofSize,
      );
      siblingsLength = numberToArray(exclusionProof, desiredProofSize);

      await expect(circuit).to.not.generateProof({
        root: BigInt(exclusionProof.root),
        siblings: exclusionProof.siblings.map((e: string) => BigInt(e)),
        siblingsLength: siblingsLength,
        directionBits: directionBits,
        key: exclusionProof.key,
        nonExistenceKey: BigInt(exclusionProof.nonExistenceKey),
        isExclusion: 0,
        dummy: 0,
      });
    });
  });
});

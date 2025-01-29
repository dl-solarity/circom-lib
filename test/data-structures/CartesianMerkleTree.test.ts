import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Poseidon } from "@iden3/js-crypto";

import { deployPoseidonFacade } from "../helpers/poseidon/poseidon-deployer";
import { Reverter } from "../helpers/reverter";

import { CartesianMerkleTreeGroth16Verifier, CartesianMerkleTreeMock } from "@ethers-v6";
import { CartesianMerkleTree } from "@zkit";

function calculatePath(merkleProof: any, desiredProofSize: number, isExclusion: boolean) {
  const siblings = merkleProof.siblings.map((e: string) => BigInt(e));

  let accHash = 0n,
    key = 0n,
    leftHash = 0n,
    rightHash = 0n;
  const directionBits = [];

  for (let i = desiredProofSize / 2 - 1; i >= 0; i--) {
    if (i == Number(merkleProof.siblingsLength / 2n - 1n)) {
      key = isExclusion ? BigInt(merkleProof.nonExistenceKey) : BigInt(merkleProof.key);

      if (siblings[2 * i] <= siblings[2 * i + 1]) {
        directionBits[i] = 0;

        leftHash = BigInt(siblings[2 * i]);
        rightHash = BigInt(siblings[2 * i + 1]);
      } else {
        directionBits[i] = 1;

        leftHash = BigInt(siblings[2 * i + 1]);
        rightHash = BigInt(siblings[2 * i]);
      }
    }

    if (i < merkleProof.siblingsLength / 2n - 1n) {
      key = BigInt(siblings[2 * i]);

      if (accHash <= siblings[2 * i + 1]) {
        directionBits[i] = 0;

        leftHash = BigInt(accHash);
        rightHash = BigInt(siblings[2 * i + 1]);
      } else {
        directionBits[i] = 1;

        leftHash = BigInt(siblings[2 * i + 1]);
        rightHash = BigInt(accHash);
      }
    }

    accHash = Poseidon.hash([key, leftHash, rightHash]);

    if (i > merkleProof.siblingsLength / 2n - 1n) {
      directionBits[i] = 0;
      accHash = 0n;
    }
  }

  return directionBits;
}

function numberToArray(merkleProof: any, desiredProofSize: number) {
  const siblingsLength = [];
  let i = 0;

  for (i; i < merkleProof.siblingsLength / 2n; i++) {
    siblingsLength[i] = 1;
  }

  for (i; i < desiredProofSize / 2; i++) {
    siblingsLength[i] = 0;
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
    const directionBits = calculatePath(merkleProof, desiredProofSize, false);
    const siblingsLength = numberToArray(merkleProof, desiredProofSize);

    const proofStruct = await circuit.generateProof({
      root: BigInt(merkleProof.root),
      siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
      siblingsLength: siblingsLength,
      key: BigInt(merkleProof.key),
      directionBits: directionBits,
      dummy: 0,
    });

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proofStruct);
  });

  it("should prove the tree inclusion for each depth of bamboo", async () => {
    for (let i = 0; i < 9; i++) {
      const rand = parseInt("1".repeat(i + 1), 2).toString();

      await cmtMock.addElement(rand);

      const merkleProof = await cmtMock.getProof(rand, desiredProofSize);

      const directionBits = calculatePath(merkleProof, desiredProofSize, false);
      const siblingsLength = numberToArray(merkleProof, desiredProofSize);

      const proofStruct = await circuit.generateProof({
        root: BigInt(merkleProof.root),
        siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
        siblingsLength: siblingsLength,
        key: BigInt(merkleProof.key),
        directionBits: directionBits,
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
    const directionBits = calculatePath(merkleProof, desiredProofSize, true);
    const siblingsLength = numberToArray(merkleProof, desiredProofSize);

    const proofStruct = await circuit.generateProof({
      root: BigInt(merkleProof.root),
      siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
      siblingsLength: siblingsLength,
      key: BigInt(merkleProof.nonExistenceKey),
      directionBits: directionBits,
      dummy: 0,
    });

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proofStruct);
  });

  it("should prove the tree exclusion for each depth of bamboo", async () => {
    for (let i = 0; i < 9; i++) {
      const rand = parseInt("1".repeat(i + 1), 2).toString();

      await cmtMock.addElement(rand);

      const merkleProof = await cmtMock.getProof(nonExistentLeaf, desiredProofSize);

      const directionBits = calculatePath(merkleProof, desiredProofSize, true);
      const siblingsLength = numberToArray(merkleProof, desiredProofSize);

      const proofStruct = await circuit.generateProof({
        root: BigInt(merkleProof.root),
        siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
        siblingsLength: siblingsLength,
        key: BigInt(merkleProof.nonExistenceKey),
        directionBits: directionBits,

        dummy: 0,
      });

      await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proofStruct);
    }
  });

  it("should prove the tree exclusion for empty tree", async () => {
    const merkleProof = await cmtMock.getProof(nonExistentLeaf, desiredProofSize);

    const directionBits = calculatePath(merkleProof, desiredProofSize, true);
    const siblingsLength = numberToArray(merkleProof, desiredProofSize);

    const proofStruct = await circuit.generateProof({
      root: BigInt(merkleProof.root),
      siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
      siblingsLength: siblingsLength,
      key: BigInt(merkleProof.nonExistenceKey),
      directionBits: directionBits,
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
      const directionBits = calculatePath(merkleProof, desiredProofSize, false);
      const siblingsLength = numberToArray(merkleProof, desiredProofSize);

      const incorrectKey = merkleProof.key + 1n;

      await expect(circuit).to.not.generateProof({
        root: BigInt(merkleProof.root),
        siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
        siblingsLength: siblingsLength,
        key: incorrectKey,
        directionBits: directionBits,
        dummy: 0,
      });
    });

    it("should revert an incorrect tree exclusion", async () => {
      for (let i = 0; i < 9; i++) {
        await cmtMock.addElement(leaves[i]);
      }

      const merkleProof = await cmtMock.getProof(nonExistentLeaf, desiredProofSize);
      const directionBits = calculatePath(merkleProof, desiredProofSize, true);
      const siblingsLength = numberToArray(merkleProof, desiredProofSize);

      await expect(circuit).to.not.generateProof({
        root: BigInt(merkleProof.root),
        siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
        siblingsLength: siblingsLength,
        key: BigInt(merkleProof.key),
        directionBits: directionBits,
        dummy: 0,
      });
    });

    it("should revert with incorrect direction path", async () => {
      for (let i = 0; i < 9; i++) {
        await cmtMock.addElement(leaves[i]);
      }

      let merkleProof = await cmtMock.getProof(nonExistentLeaf, desiredProofSize);
      let directionBits = calculatePath(merkleProof, desiredProofSize, true);
      let siblingsLength = numberToArray(merkleProof, desiredProofSize);

      let wrongPath = directionBits.map((e: number) => 1 - e);

      await expect(circuit).to.not.generateProof({
        root: BigInt(merkleProof.root),
        siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
        siblingsLength: siblingsLength,
        key: BigInt(merkleProof.nonExistenceKey),
        directionBits: wrongPath,
        dummy: 0,
      });

      merkleProof = await cmtMock.getProof(leaves[2], desiredProofSize);
      directionBits = calculatePath(merkleProof, desiredProofSize, false);
      siblingsLength = numberToArray(merkleProof, desiredProofSize);

      wrongPath = directionBits.map((e: number) => 1 - e);

      await expect(circuit).to.not.generateProof({
        root: BigInt(merkleProof.root),
        siblings: merkleProof.siblings.map((e: string) => BigInt(e)),
        siblingsLength: siblingsLength,
        key: BigInt(merkleProof.key),
        directionBits: wrongPath,
        dummy: 0,
      });
    });
  });
});

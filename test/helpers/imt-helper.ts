import { ethers } from "hardhat";

import { MerkleTree } from "merkletreejs";

export function getRoot(tree: MerkleTree) {
  return "0x" + tree.getRoot().toString("hex");
}

export function getPositionalProof(tree: MerkleTree, leaf: string): [number[], string[]] {
  const positionalProof = tree.getPositionalHexProof(leaf);
  const positions = positionalProof.map((e) => Number(e[0]));
  const data = positionalProof.map((e) => ethers.toBeHex(e[1], 32));

  return [positions, data];
}

export function buildFullTree(hashFunc: any, leaves: string[], height: number) {
  const elementsToAdd = 2 ** height - leaves.length;
  const zeroHash = hashFunc("0x0000000000000000000000000000000000000000000000000000000000000000");
  const zeroElements = Array(elementsToAdd).fill(zeroHash);

  return new MerkleTree([...leaves, ...zeroElements], hashFunc, {
    hashLeaves: false,
    sortPairs: false,
  });
}

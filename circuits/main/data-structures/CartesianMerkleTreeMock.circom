pragma circom 2.1.6;

include "../../data-structures/CartesianMerkleTree.circom";

component main {public [root]} = CartesianMerkleTree(10);

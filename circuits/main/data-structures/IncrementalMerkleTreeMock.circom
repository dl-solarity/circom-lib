pragma circom 2.1.6;

include "../../data-structures/IncrementalMerkleTree.circom";

component main {public [root]} = IncrementalMerkleTree(10);
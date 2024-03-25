pragma circom 2.0.0;

include "../../data-structures/SparseMerkleTree.circom";

component main {public [root]} = SparseMerkleTreeVerifier(10);

pragma circom 2.1.6;

include "../../data-structures/SparseMerkleTree.circom";

component main {public [root]} = SparseMerkleTree(10);

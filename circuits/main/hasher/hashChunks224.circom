pragma circom 2.1.6;

include "../../../circuits/hasher/hash.circom";

component main = ShaHashChunks(1, 224);

pragma circom 2.1.6;

include "./sha1/sha1.circom";
include "./sha2/sha224/sha224.circom";
include "./sha2/sha256/sha256.circom";
include "./sha2/sha384/sha384.circom";
include "./sha2/sha512/sha512.circom";
include "./poseidon/poseidon.circom";

/*
* Here is secure implementation of sha-1 and sha-2 hash algoritms.
* There are two versions of hashers - for bits and chunks.
* Bit implementation do padding by itself, so use it if you don`t understand how padding works.
* Chunk implementation is hashing already padded message, use it if you want to have 1 circuit for many cases of input len,
* but you should do padding in off-circuit computations.
* BLOCK_NUM or LEN is len in blocks or bits of message, algo is hash algo we should use (list below \/\/\/)
* We don`t waste constraints for many hashers in one template because we know what algo will be at the moment of compilation.
* List of ALGO:
* Sha1:     160
* Sha2-224: 224
* Sha2-256: 256
* Sha2-384: 384
* Sha2-512: 512
*/
template ShaHashChunks(BLOCK_NUM, ALGO) {
    assert(ALGO == 160 || ALGO == 224 || ALGO == 256 || ALGO == 384 || ALGO == 512);

    var BLOCK_SIZE = 512;

    if (ALGO > 256) {
        BLOCK_SIZE = 1024;
    }

    signal input in[BLOCK_SIZE * BLOCK_NUM];
    signal input dummy;

    signal output out[ALGO];

    if (ALGO == 160) {
        component hash160 = Sha1HashChunks(BLOCK_NUM);
        hash160.in <== in;
        hash160.dummy <== dummy;

        hash160.out ==> out;
    }

    if (ALGO == 224) {
        component hash224 = Sha224HashChunks(BLOCK_NUM);
        hash224.in <== in;
        hash224.dummy <== dummy;

        hash224.out ==> out;
    }

    if (ALGO == 256) {
        component hash256 = Sha256HashChunks(BLOCK_NUM);
        hash256.in <== in;
        hash256.dummy <== dummy;

        hash256.out ==> out;
    }

    if (ALGO == 384) {
        component hash384 = Sha384HashChunks(BLOCK_NUM);
        hash384.in <== in;
        hash384.dummy <== dummy;

        hash384.out ==> out;
    }

    if (ALGO == 512) {
        component hash512 = Sha512HashChunks(BLOCK_NUM);
        hash512.in <== in;
        hash512.dummy <== dummy;

        hash512.out ==> out;
    }
}

template ShaHashBits(LEN, ALGO) {
    assert(ALGO == 160 || ALGO == 224 || ALGO == 256 || ALGO == 384 || ALGO == 512);

    var BLOCK_SIZE = 512;

    if (ALGO > 256) {
        BLOCK_SIZE = 1024;
    }

    signal input in[LEN];
    signal input dummy;

    signal output out[ALGO];

    if (ALGO == 160) {
        component hash160 = Sha1HashBits(LEN);
        hash160.in <== in;
        hash160.dummy <== dummy;

        hash160.out ==> out;
    }

    if (ALGO == 224) {
        component hash224 = Sha224HashBits(LEN);
        hash224.in <== in;
        hash224.dummy <== dummy;

        hash224.out ==> out;
    }

    if (ALGO == 256) {
        component hash256 = Sha256HashBits(LEN);
        hash256.in <== in;
        hash256.dummy <== dummy;

        hash256.out ==> out;
    }

    if (ALGO == 384) {
        component hash384 = Sha384HashBits(LEN);
        hash384.in <== in;
        hash384.dummy <== dummy;

        hash384.out ==> out;
    }

    if (ALGO == 512) {
        component hash512 = Sha512HashBits(LEN);
        hash512.in <== in;
        hash512.dummy <== dummy;

        hash512.out ==> out;
    }
}

/*
* Here is secure implementation of Poseidon hash algoritm.
* LEN in lenght of input vector.
* Poseidon works with vectors, not just nums or bits, so use 1 element arr in case of one number.
* Max LEN is 16, but if you want to connect this to solidity smart contracts, remember that they have only Poseidon(6).
* You can use this for verification: https://poseidon-hash.online/
*/
template PoseidonHash(LEN) {
    assert (LEN <= 16);
    assert (LEN > 0);

    signal input in[LEN];
    signal input dummy;

    signal output out;

    dummy * dummy === 0;

    component poseidon = Poseidon(LEN);
    poseidon.in <== in;
    poseidon.dummy <== dummy;

    out <== poseidon.out;
}
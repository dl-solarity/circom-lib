pragma circom 2.1.6;

include "../bitify/bitify.circom";
include "../hasher/poseidon/poseidon.circom";
include "../utils/switcher.circom";

/**
 * Hash2 = Poseidon(H_L | H_R)
 */
template Hash2() {
    signal input a;
    signal input b;
    signal input dummy;

    signal output out;

    component h = Poseidon(2);
    h.in[0] <== a;
    h.in[1] <== b;
    h.dummy <== dummy;

    out <== h.out;
}

template IncrementalMerkleTree(depth) {
    signal input leaf;

    signal input directionBits;
    signal input branches[depth];

    signal input root;

    signal input dummy;

    component hashers[depth];
    component switchers[depth];

    signal depthHashes[depth + 1];
    depthHashes[0] <== leaf;

    component dirBitsArray = Num2Bits(depth);
    dirBitsArray.in <== directionBits;

    // Start with the leaf
    for (var i = 0; i < depth; i++) { 
        switchers[i] = Switcher();
        switchers[i].L <== branches[i];
        switchers[i].R <== depthHashes[i];
        // Num2Bits places the most significant bit on the right,
        // so we need to iterate through the path from the end
        switchers[i].sel <== dirBitsArray.out[depth - i - 1];

        hashers[i] = Hash2();
        hashers[i].a <== switchers[i].outL;
        hashers[i].b <== switchers[i].outR;
        hashers[i].dummy <== dummy;

        depthHashes[i + 1] <== hashers[i].out;
    }

    root === depthHashes[depth];
}

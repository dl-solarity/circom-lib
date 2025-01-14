pragma circom 2.1.6;

include "../hasher/poseidon/poseidon.circom";

/**
 * Hash1 = Poseidon(nullifier)
 */
template Hash1() {
    signal input a;
    signal input dummy;

    signal output out;

    component h = Poseidon(1);
    h.in[0] <== a;
    h.dummy <== dummy;

    out <== h.out;
}

/**
 * Hash2 = Poseidon(nullifier | secret)
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

/**
 * This circuit is a simple commitment circuit that takes a nullifier and a secret and returns a commitment.
 * The commitment is the result of hashing the secret and the nullifier together using a Poseidon hash function.
 */
template Commitment() {
    signal input nullifier;
    signal input secret;
    signal input dummy;

    signal output commitment;
    signal output nullifierHash;
    
    dummy * dummy === 0;

    component commitmentHash = Hash2();
    commitmentHash.a <== nullifier;
    commitmentHash.b <== secret;
    commitmentHash.dummy <== dummy;

    commitment <== commitmentHash.out;

    component nullifierHasher = Hash1();
    nullifierHasher.a <== nullifier;
    nullifierHasher.dummy <== dummy;

    nullifierHash <== nullifierHasher.out;
}

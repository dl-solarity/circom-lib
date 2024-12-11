pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";

/*
 * Hash1 = Poseidon(nullifier)
 */
template Hash1() {
    signal input a;

    signal output out;

    component h = Poseidon(1);
    h.inputs[0] <== a;

    out <== h.out;
}

/*
 * Hash2 = Poseidon(nullifier | secret)
 */
template Hash2() {
    signal input a;
    signal input b;

    signal output out;

    component h = Poseidon(2);
    h.inputs[0] <== a;
    h.inputs[1] <== b;

    out <== h.out;
}

/*
 * This circuit is a simple commitment circuit that takes a nullifier and a secret and returns a commitment.
 * The commitment is the result of hashing the secret and the nullifier together using a Poseidon hash function.
 */
template CommitmentVerifier() {
    signal input nullifier;
    signal input secret;

    signal output commitment;
    signal output nullifierHash;

    component commitmentHash = Hash2();
    commitmentHash.a <== nullifier;
    commitmentHash.b <== secret;

    commitment <== commitmentHash.out;

    component nullifierHasher = Hash1();
    nullifierHasher.a <== nullifier;

    nullifierHash <== nullifierHasher.out;
}

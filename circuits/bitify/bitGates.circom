pragma circom 2.1.6;

/**
 * Here are templates for all bit gates for any 1 or 2 inputs.
 * For 1-input gates interface is input in and output out.
 * For 2-input gates interface is input in[2] and output out.
 * 3-input gates may be added later.
 */

/**
 * One input gates
 */

// a
// 0 -> 0
// 1 -> 1
template BUFFER() {
    signal input in;
    signal output out;

    out <== in;
}

// !a
// !0 = 1
// !1 = 0
template NOT() {
    signal input in;
    signal output out;

    out <== 1 - in;
}

/**
 * Two input gates
 */

// a ∧ b
// 0 ∧ 0 = 0
// 1 ∧ 0 = 0
// 0 ∧ 1 = 0
// 1 ∧ 1 = 1
template AND() {
    signal input in[2];
    signal output out;

    out <== in[0] * in[1];
}

// a ∨ b
// 0 ∨ 0 = 0
// 1 ∨ 0 = 1
// 0 ∨ 1 = 1
// 1 ∨ 1 = 1
template OR() {
    signal input in[2];
    signal output out;

    out <== in[0] + in[1] - in[0] * in[1];
}

// !(a ∧ b)
// !(0 ∧ 0) = 1
// !(1 ∧ 0) = 1
// !(0 ∧ 1) = 1
// !(1 ∧ 1) = 0
template NAND() {
    signal input in[2];
    signal output out;

    out <== 1 - in[0] * in[1];
}

// !(a ∨ b)
// !(0 ∨ 0) = 1
// !(1 ∨ 0) = 0
// !(0 ∨ 1) = 0
// !(1 ∨ 1) = 0
template NOR() {
    signal input in[2];
    signal output out;

    out <== 1 - in[0] + in[1] + in[0] * in[1];
}

// A ⊕ B
// 0 ⊕ 0 = 0
// 1 ⊕ 0 = 1
// 0 ⊕ 1 = 1
// 1 ⊕ 1 = 0
template XOR() {
    signal input in[2];
    signal output out;

    out <== in[0] + in[1] - 2 * in[0] * in[1];
} 

// !(A ⊕ B)
// !(0 ⊕ 0) = 1
// !(1 ⊕ 0) = 0
// !(0 ⊕ 1) = 0
// !(1 ⊕ 1) = 1
template XNOR() {
    signal input in[2];
    signal output out;

    out <== 1 - in[0] - in[1] + 2 * in[0] * in[1];
}

// A → B
// 0 → 0 = 1
// 1 → 0 = 1
// 0 → 1 = 0
// 1 → 1 = 1
template IMPLY() {
    signal input in[2];
    signal output out;

    out <== 1 - in[0] + in[1] - (1 - in[0]) * in[1];
}

// !(A → B)
// !(0 → 0) = 0
// !(1 → 0) = 0
// !(0 → 1) = 1
// !(1 → 1) = 0
template NIMPLY() {
    signal input in[2];
    signal output out;

    out <== in[0] - in[1] + (1 - in[0]) * in[1];
}

// A
// 0 0 -> 0
// 1 0 -> 1
// 0 1 -> 0
// 1 1 -> 1
template A() {
    signal input in[2];
    signal output out;

    out <== in[0];
}

// !A
// 0 0 -> 1
// 1 0 -> 0
// 0 1 -> 1
// 1 1 -> 0
template NOTA() {
    signal input in[2];
    signal output out;

    out <== 1 - in[0];
}

// B
// 0 0 -> 0
// 1 0 -> 0
// 0 1 -> 1
// 1 1 -> 1
template B() {
    signal input in[2];
    signal output out;

    out <== in[1];
}

// !B
// 0 0 -> 1
// 1 0 -> 1
// 0 1 -> 0
// 1 1 -> 0
template NOTB() {
    signal input in[2];
    signal output out;

    out <== 1 - in[1];
}

// true
// 0 0 -> 1
// 1 0 -> 1
// 0 1 -> 1
// 1 1 -> 1
template TRUE() {
    signal input in[2];
    signal output out;

    out <== 1;
}

// true
// 0 0 -> 0
// 1 0 -> 0
// 0 1 -> 0
// 1 1 -> 0
template FALSE() {
    signal input in[2];
    signal output out;

    out <== 0;
}

// B → A
// 0 0 -> 0
// 1 0 -> 1
// 0 1 -> 0
// 1 1 -> 0
template INVIMPLY() {
    signal input in[2];
    signal output out;

    out <== 1 + in[0] - in[1] - in[0] * (1 - in[1]);
}

// !(B → A)
// 0 0 -> 1
// 1 0 -> 0
// 0 1 -> 1
// 1 1 -> 1
template NINVNIMPLY() {
    signal input in[2];
    signal output out;

    out <== in[1] - in[0] + in[0] * (1 - in[1]);
}

// Xor for n pairs
template Xor2(n) {
    signal input in1[n];
    signal input in2[n];

    signal output out[n];

    for (var k = 0; k < n; k++) {
        out[k] <== in1[k] + in2[k] - 2 * in1[k] * in2[k];
    }
}

/**
 * Source: https://github.com/iden3/circomlib/blob/v2.0.5/circuits/gates.circom
 */
template MultiAND(n) {
    signal input in[n];
    signal output out;

    component and1;
    component and2;
    component ands[2];

    if (n==1) {
        out <== in[0];
    } else if (n==2) {
        and1 = AND();
        and1.in[0] <== in[0];
        and1.in[1] <== in[1];

        out <== and1.out;
    } else {
        and2 = AND();

        var n1 = n\2;
        var n2 = n-n\2;

        ands[0] = MultiAND(n1);
        ands[1] = MultiAND(n2);

        var i;
        for (i=0; i<n1; i++) {
            ands[0].in[i] <== in[i];
        }

        for (i=0; i<n2; i++) {
            ands[1].in[i] <== in[n1+i];
        }

        and2.in[0] <== ands[0].out;
        and2.in[1] <== ands[1].out;

        out <== and2.out;
    }
}

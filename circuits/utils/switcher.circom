pragma circom 2.1.6;

/**
 * Source: https://github.com/iden3/circomlib/blob/v2.0.5/circuits/switcher.circom
 */
template Switcher() {
    signal input sel;
    signal input L;
    signal input R;

    signal output outL;
    signal output outR;

    signal aux;

    aux <== (R - L) * sel;
    outL <== aux + L;
    outR <== -aux + R;
}

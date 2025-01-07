pragma circom 2.1.6;

include "./compconstant.circom";

/**
 * Source: https://github.com/iden3/circomlib/blob/v2.0.5/circuits/aliascheck.circom
 */
template AliasCheck() {
    signal input in[254];

    component compConstant = CompConstant(-1);

    for (var i = 0; i < 254; i++) {
        in[i] ==> compConstant.in[i];
    }

    compConstant.out === 0;
}

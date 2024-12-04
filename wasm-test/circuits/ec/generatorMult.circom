pragma circom  2.1.6;

include "../../../circuits/ec/curve.circom";

// secp256k1 params
component main = EllipicCurveScalarGeneratorMultiplication(64, 4, [0,0,0,0], [7,0,0,0], [18446744069414583343, 18446744073709551615, 18446744073709551615, 18446744073709551615]);

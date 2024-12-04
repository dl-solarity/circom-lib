pragma circom  2.1.6;

include "../../../circuits/signatures/rsa.circom";

component main = RsaVerifyPkcs1v15(64, 64, 65537, 256);
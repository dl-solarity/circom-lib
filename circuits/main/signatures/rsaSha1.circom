pragma circom 2.1.6;

include "../../../circuits/signatures/rsa.circom";

component main {public [pubkey, signature, hashed]} = RsaVerifyPkcs1v15(64, 32, 65537, 160);

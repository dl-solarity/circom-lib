pragma circom  2.1.6;

include "./bitify.circom";

//------------------------------------------------------------------------------
// calculate bin sum of NUM numbers each LEN BITS
// out is LEN + NUM - 1 LEN bit number

template BinSum(NUM, LEN){
    assert (LEN + NUM - 1 <= 253);
    var OUT_LEN = LEN + NUM - 1;
    signal input in[NUM][LEN];
    signal input dummy;
    dummy * dummy === 0;
    signal output out[OUT_LEN];

    component bits2Num[NUM];
    component sumN = GetSumOfNElements(NUM);
    sumN.dummy <== dummy;
    for (var i = 0; i < NUM; i++) {
        bits2Num[i] = Bits2Num(LEN);
        bits2Num[i].in <== in[i];
        sumN.in[i] <== bits2Num[i].out;
    }
    component num2Bits = Num2Bits(OUT_LEN);
    num2Bits.in <== sumN.out;

    out <== num2Bits.out;

}
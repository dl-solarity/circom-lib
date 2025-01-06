pragma circom 2.1.6;

include "../bitify/comparators.circom";
include "../bitify/bitify.circom";

/**
 * Some templates for num operations.
 */

/**
 * Gets inversion in circom prime field.
 * out * in === 1
 */
template Inverse() {
    signal input in;
    
    signal output out;

    out <-- 1 / in;
    out * in === 1;
}

/**
 * THIS IS UNSECURE VERSION, NEVER (NEVER!!!!!!!!!!!!!) USE IT IN PRODUCTION!!!!
 * I hope secure version will appear later.
 * Use if you don`t know what is len of bit representation of in[0] is.
 */
template DivisionStrict() {
    signal input in[2];
    
    signal output mod;
    signal output div;
    
    mod <-- in[0] % in[1];
    div <-- in[0] \ in[1];
    
    div * in[1] + mod === in[0];

    component check1 = LessEqThan(252);    
    check1.in[0] <== div * in[1];
    check1.in[1] <== in[0];
    check1.out === 1;
    
    component check2 = GreaterThan(252);
    check2.in[0] <== (div + 1) * in[1];
    check2.in[1] <== in[0];
    check2.out === 1;    
}

/**
 * THIS IS UNSECURE VERSION, NEVER (NEVER!!!!!!!!!!!!!) USE IT IN PRODUCTION!!!!!
 * I hope secure version will appear later.
 * Use this if you know what len of bit representation of in[1] is.
 */
template Division(LEN) {    
    assert (LEN < 253);

    signal input in[2];
    
    signal output div;
    signal output mod;
    
    mod <-- in[0] % in[1];
    div <-- in[0] \ in[1];
    
    div * in[1] + mod === in[0];
    
    component check1 = LessEqThan(LEN);
    check1.in[0] <== div * in[1];
    check1.in[1] <== in[0];
    check1.out === 1;
    
    component check2 = GreaterThan(LEN);
    check2.in[0] <== (div + 1) * in[1];
    check2.in[1] <== in[0];
    check2.out === 1;
}

/**
 * Calculated log_2 rounded down (for example, 2.3 ===> 2),
 * also can be used as index of first 1 bit in number.
 * Don`t use it for 0!!!
 */
template Log2CeilStrict() {
    signal input in;

    signal output out;
    
    signal bits[252];

    component n2b = Num2Bits(252);
    n2b.in <== in - 1;
    n2b.out ==> bits;
    
    signal counter[252];
    signal sum[252];
    
    counter[0] <== bits[251];
    sum[0] <== counter[0];
    
    for (var i = 1; i < 252; i++) {
        counter[i] <== (1 - counter[i - 1]) * bits[251 - i] + counter[i - 1];
        sum[i] <== sum[i - 1] + counter[i];
    }
    
    out <== sum[251];
}

/**
 * To calculate log ceil, we should convert num to bits, and if we know it`s len, we already know the answer,
 * but if you know estimed range of num, you can use this to reduce num of constraints (num < 2 ** RANGE).
 * For example, you don`t need to use convert num to 254 bits if you know that is always less that 1000.
 */
template Log2Ceil(RANGE) {
    signal input in;
    signal output out;
    
    signal bits[RANGE];

    component n2b = Num2Bits(RANGE);
    n2b.in <== in - 1;
    n2b.out ==> bits;
    
    signal counter[RANGE];
    signal sum[RANGE];
    
    counter[0] <== bits[RANGE - 1];
    sum[0] <== counter[0];
    
    for (var i = 1; i < RANGE; i++) {
        counter[i] <== (1 - counter[i - 1]) * bits[RANGE - 1 - i] + counter[i - 1];
        sum[i] <== sum[i - 1] + counter[i];
    }
    
    out <== sum[RANGE - 1];
}

/**
 * Computes last bit of num with any bit len for 2 constraints.
 * Returns bit (0 or 1) and div = num \ 2.
 */
template GetLastBit() {
    signal input in;

    signal output bit;
    signal output div;
    
    bit <-- in % 2;
    div <-- in \ 2;
    
    (1 - bit) * bit === 0;
    div * 2 + bit * bit === in;
}

/**
 * Computes last n bits of any num, returns array of bits and div.
 * In fact, this is also just a div for (2 ** N).
 * For now, this is only one secured div that can be used.
 */
template GetLastNBits(N) {
    signal input in;
    
    signal output div;
    signal output out[N];
    
    component getLastBit[N];

    for (var i = 0; i < N; i++) {
        getLastBit[i] = GetLastBit();
        if (i == 0) {
            getLastBit[i].in <== in;
        } else {
            getLastBit[i].in <== getLastBit[i - 1].div;
        }
        out[i] <== getLastBit[i].bit;
    }
    
    div <== getLastBit[N - 1].div;
}

/**
 * Get sum of N elements with 1 constraint.
 * Use this instead of a + b + ... + c;
 * Circom will drop linear constaraint because of optimisation.
 * This one adds dummy * dummy (0) to make it quadratic.
 */
template GetSumOfNElements(N) { 
    assert (N >= 2);
    
    signal input in[N];
    signal input dummy;
    
    signal output out;

	dummy * dummy === 0;
    
    signal sum[N - 1];
    
    for (var i = 0; i < N - 1; i++) {
        if (i == 0) {
            sum[i] <== in[i] + in[i + 1];
        } else {
            sum[i] <== sum[i - 1] + in[i + 1];
        }
    }

    out <== sum[N - 2] + dummy * dummy;
}

pragma circom 2.1.6;

include "../sha2Common.circom";
include "./internal/sha512InitialValue.circom";
include "./internal/sha512Compress.circom";
include "./internal/sha512RoundConst.circom";

template Sha512HashChunks(BLOCK_NUM) {    
    signal input in[BLOCK_NUM * 1024];
    signal input dummy;

    signal output out[512];
    
    dummy * dummy === 0;
    
    signal states[BLOCK_NUM + 1][8][64];
    
    component iv = Sha512InitialValue();
    iv.out ==> states[0];
    
    component sch[BLOCK_NUM];
    component rds[BLOCK_NUM];
    
    for (var m = 0; m < BLOCK_NUM; m++) {
        sch[m] = Sha2_384_512Schedule();
        sch[m].dummy <== dummy;
        rds[m] = Sha2_384_512Rounds(80);
        rds[m].dummy <== dummy;
        
        for (var k = 0; k < 16; k++) {
            for (var i = 0; i < 64; i++) {
                sch[m].chunkBits[k][i] <== in[m * 1024 + k * 64 + (63 - i)];
            }
        }
        
        sch[m].outWords ==> rds[m].words;
        
        rds[m].inpHash <== states[m];
        rds[m].outHash ==> states[m + 1];
    }
    
    for (var j = 0; j < 8; j++) {
        for (var i = 0; i < 64; i++) {
            out[j * 64 + i] <== states[BLOCK_NUM][j][63 - i];
        }
    }
}

template Sha512HashBits(LEN) {    
    signal input in[LEN];
    signal input dummy;

    signal output out[512];

    dummy * dummy === 0;

    component addPadding = ShaPadding(LEN, 1024);
    addPadding.in <== in;

    var BLOCK_NUM = ((LEN + 1 + 128) + 1024 - 1) \ 1024;
    
    signal states[BLOCK_NUM + 1][8][64];
    
    component iv = Sha512InitialValue();
    iv.out ==> states[0];
    
    component sch[BLOCK_NUM];
    component rds[BLOCK_NUM];
    
    for (var m = 0; m < BLOCK_NUM; m++) {        
        sch[m] = Sha2_384_512Schedule();
        sch[m].dummy <== dummy;

        rds[m] = Sha2_384_512Rounds(80);
        rds[m].dummy <== dummy;
        
        for (var k = 0; k < 16; k++) {
            for (var i = 0; i < 64; i++) {
                sch[m].chunkBits[k][i] <== addPadding.out[m * 1024 + k * 64 + (63 - i)];
            }
        }
        
        sch[m].outWords ==> rds[m].words;
        
        rds[m].inpHash <== states[m];
        rds[m].outHash ==> states[m + 1];
    }
    
    for (var j = 0; j < 8; j++) {
        for (var i = 0; i < 64; i++) {
            out[j * 64 + i] <== states[BLOCK_NUM][j][63 - i];
        }
    }
}

/**
 * execute `n` rounds of the SHA384 / SHA512 inner loop
 * NOTE: hash state is stored as 8 qwords, each little-endian
 */
template Sha2_384_512Rounds(n) {
    assert(n > 0);
    assert(n <= 80);
    
    signal input words[n];
    signal input inpHash[8][64];
    signal input dummy;

    signal output outHash[8][64];
    
    dummy * dummy === 0;
    
    signal a [n + 1][64];
    signal b [n + 1][64];
    signal c [n + 1][64];
    signal dd[n + 1];
    signal e [n + 1][64];
    signal f [n + 1][64];
    signal g [n + 1][64];
    signal hh[n + 1];
    
    signal ROUND_KEYS[80];
    
    component roundKeys = SHA2_384_512RoundKeys();
    ROUND_KEYS <== roundKeys.out;
    
    a[0] <== inpHash[0];
    b[0] <== inpHash[1];
    c[0] <== inpHash[2];
    
    e[0] <== inpHash[4];
    f[0] <== inpHash[5];
    g[0] <== inpHash[6];
    
    component sumDd = GetSumOfNElements(64);
    sumDd.dummy <== dummy;

    component sumHh = GetSumOfNElements(64);
    sumHh.dummy <== dummy;

    for (var i = 0; i < 64; i++) {
        sumDd.in[i] <== inpHash[3][i] * (1 << i);
        sumHh.in[i] <== inpHash[7][i] * (1 << i);
    }

    dd[0] <== sumDd.out;
    hh[0] <== sumHh.out;
    
    signal hashWords[8];
    component sum[8];

    for (var j = 0; j < 8; j++) {
        sum[j] = GetSumOfNElements(64);
        sum[j].dummy <== dummy;

        for (var i = 0; i < 64; i++) {
            sum[j].in[i] <== (1 << i) * inpHash[j][i];
        }

        hashWords[j] <== sum[j].out;
    }
    
    component compress[n];
    
    for (var k = 0; k < n; k++) {        
        compress[k] = Sha2_384_512CompressInner();
        
        compress[k].inp <== words[k];
        compress[k].key <== ROUND_KEYS[k];
        compress[k].dummy <== dummy;

        compress[k].a <== a[k];
        compress[k].b <== b[k];
        compress[k].c <== c[k];
        compress[k].dd <== dd[k];
        compress[k].e <== e[k];
        compress[k].f <== f[k];
        compress[k].g <== g[k];
        compress[k].hh <== hh[k];
        
        compress[k].outA ==> a[k + 1];
        compress[k].outB ==> b[k + 1];
        compress[k].outC ==> c[k + 1];
        compress[k].outDD ==> dd[k + 1];
        compress[k].outE ==> e[k + 1];
        compress[k].outF ==> f[k + 1];
        compress[k].outG ==> g[k + 1];
        compress[k].outHH ==> hh[k + 1];
    }
    
    component modulo[8];

    for (var j = 0; j < 8; j++) {
        modulo[j] = GetLastNBits(64);
    }
    
    component sumA = GetSumOfNElements(64);
    sumA.dummy <== dummy;
    
    component sumB = GetSumOfNElements(64);
    sumB.dummy <== dummy;

    component sumC = GetSumOfNElements(64);
    sumC.dummy <== dummy;

    component sumE = GetSumOfNElements(64);
    sumE.dummy <== dummy;

    component sumF = GetSumOfNElements(64);
    sumF.dummy <== dummy;

    component sumG = GetSumOfNElements(64);
    sumG.dummy <== dummy;
    
    for (var i = 0; i < 64; i++) {
        sumA.in[i] <== (1 << i) * a[n][i];
        sumB.in[i] <== (1 << i) * b[n][i];
        sumC.in[i] <== (1 << i) * c[n][i];
        sumE.in[i] <== (1 << i) * e[n][i];
        sumF.in[i] <== (1 << i) * f[n][i];
        sumG.in[i] <== (1 << i) * g[n][i];
    }
    
    modulo[0].in <== hashWords[0] + sumA.out + dummy * dummy;
    modulo[1].in <== hashWords[1] + sumB.out + dummy * dummy;
    modulo[2].in <== hashWords[2] + sumC.out + dummy * dummy;
    modulo[3].in <== hashWords[3] + dd[n] + dummy * dummy;
    modulo[4].in <== hashWords[4] + sumE.out + dummy * dummy;
    modulo[5].in <== hashWords[5] + sumF.out + dummy * dummy;
    modulo[6].in <== hashWords[6] + sumG.out + dummy * dummy;
    modulo[7].in <== hashWords[7] + hh[n] + dummy * dummy;
    
    for (var j = 0; j < 8; j++) {
        modulo[j].out ==> outHash[j];
    }   
}

/**
 * message schedule for SHA384 / SHA512
 * NOTE: the individual 64 bit words are in little-endian order
 */
template Sha2_384_512Schedule() {    
    signal input chunkBits[16][64]; 
    signal input dummy;
    
    signal output outWords [80]; 

    dummy * dummy === 0;

    signal outBits[80][64]; 
    
    component sumN[16];

    for (var k = 0; k < 16; k++) {
        sumN[k] = GetSumOfNElements(64);
        sumN[k].dummy <== dummy;

        for (var i = 0; i < 64; i++) {
            sumN[k].in[i] <== (1 << i) * chunkBits[k][i];
        }

        outWords[k] <== sumN[k].out;
        outBits [k] <== chunkBits[k];
    }
    
    component s0Xor[80 - 16][64];
    component s1Xor[80 - 16][64];
    component modulo[80 - 16];
    
    component bits2Num[80 - 16];

    component s0Sum[80 - 16];
    component s1Sum[80 - 16];

    for (var m = 16; m < 80; m++) {
        var r = m - 16;
        var k = m - 15;
        var l = m - 2;
        
        s0Sum[m - 16] = GetSumOfNElements(64);
        s0Sum[m - 16].dummy <== dummy;
        s1Sum[m - 16] = GetSumOfNElements(64);
        s1Sum[m - 16].dummy <== dummy;
        
        for (var i = 0; i < 64; i++) {
            // note: with XOR3_v2, circom optimizes away the constant zero `z` thing
            // with XOR3_v1, it does not. But otherwise it's the same number of constraints.            
            s0Xor[r][i] = XOR3_v2();
            s0Xor[r][i].x <== outBits[k][(i + 1) % 64];
            s0Xor[r][i].y <== outBits[k][(i + 8) % 64];
            s0Xor[r][i].z <== (i < 64 - 7) ? outBits[k][(i + 7)] : 0;

            s0Sum[m - 16].in[i] <== (1 << i) * s0Xor[r][i].out;
            
            s1Xor[r][i] = XOR3_v2();
            s1Xor[r][i].x <== outBits[l][(i + 19) % 64];
            s1Xor[r][i].y <== outBits[l][(i + 61) % 64];
            s1Xor[r][i].z <== (i < 64 - 6) ? outBits[l][(i + 6)] : 0;

            s1Sum[m - 16].in[i] <== (1 << i) * s1Xor[r][i].out;
        }
        
        modulo[r] = GetLastNBits(64);
        modulo[r].in <== s1Sum[r].out + outWords[m - 7] + s0Sum[r].out + outWords[m - 16];
        modulo[r].out ==> outBits[m];

        bits2Num[r] = Bits2Num(64);
        bits2Num[r].in <== outBits[m];
        bits2Num[r].out ==> outWords[m];
    }
}

pragma circom 2.1.6;

include "../hasher/poseidon/poseidon.circom";
include "../bitify/comparators.circom";

function inverse(a) {
    return 1 - a;
}

/**
 * Hash3 = Poseidon(key | left.merkleHash | right.merkleHash)
 */
template Hash3() {
    signal input a;
    signal input b;
    signal input c;    
    signal input dummy;

    signal output out;

    component h = Poseidon(3);
    h.in[0] <== a;
    h.in[1] <== b;
    h.in[2] <== c;
    h.dummy <== dummy;

    out <== h.out;
}

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

/**
 * Determines the type of the node
 */
template NodeTypeDeterminer() {
    // 1 if the node is at the desired depth, 0 otherwise
    signal input isDesiredDepth;
    signal input previousMiddle;
    signal input previousLeaf;

    // 1 if the node is a middle node, 0 otherwise
    signal output middle;  
    // 1 if the node is a leaf node, 0 otherwise
    signal output leaf;

    // Determine the node as a leaf, when we are at the desired depth
    leaf <== isDesiredDepth - previousLeaf - previousMiddle;
    // Determine the node as a middle, when we are at the desired depth 
    // and current node is not leaf
    middle <== isDesiredDepth * inverse(leaf);
}

/**
 * Gets hash at the current depth, based on the type of the node
 */
template DepthHasher() {
    signal input isMiddle;
    signal input isLeaf;

    signal input key;
    signal input sibling1;
    signal input sibling2;
    // directionBit = 0 means that sibling1 <= sibling2
    signal input directionBit;
    signal input accHash;

    signal input dummy;

    signal output root;

    component leafSwitcher = Switcher();
    leafSwitcher.L <== sibling1;
    leafSwitcher.R <== sibling2;
    // Based on the direction bit, we understand which order to use
    leafSwitcher.sel <== directionBit;

    component leafHash = Hash3();
    leafHash.a <== key;
    leafHash.b <== leafSwitcher.outL;
    leafHash.c <== leafSwitcher.outR;
    leafHash.dummy <== dummy;

    component middleSwitcher = Switcher();
    middleSwitcher.L <== accHash;
    middleSwitcher.R <== sibling1;
    // directionBit is 0 when accHash <= sibling1
    middleSwitcher.sel <== directionBit;

    component middleHash = Hash3();
    middleHash.a <== sibling2;
    middleHash.b <== middleSwitcher.outL;
    middleHash.c <== middleSwitcher.outR;
    middleHash.dummy <== dummy;

    signal res[2];
    // hash of the leaf node
    res[0] <== leafHash.out * isLeaf;

    // hash of the middle node
    res[1] <== middleHash.out * isMiddle;

    // only one of the following will be non-zero
    root <== res[0] + res[1];
}

template CartesianMerkleTree(proofSize) {
    signal input root;
    signal input siblings[proofSize];

    var maxDepth = proofSize / 2;

    // siblingsLength[i] is 1 when i-th sibling exists, 0 otherwise
    signal input siblingsLength[maxDepth];
    signal input key;
    // directionBits[i] is 0 when leftHash <= rightHash
    signal input directionBits[maxDepth];  

    signal input dummy;
     
    dummy * dummy === 0;

    component nodeType[maxDepth];

    // Start with the leaf node
    for (var i = maxDepth - 1; i >= 0; i--) {
        nodeType[i] = NodeTypeDeterminer();

        if (i == maxDepth - 1) {
            nodeType[i].previousMiddle <== 0;
            nodeType[i].previousLeaf <== 0;
        } else {
            nodeType[i].previousMiddle <== nodeType[i + 1].middle;
            nodeType[i].previousLeaf <== nodeType[i + 1].leaf;
        }

        nodeType[i].isDesiredDepth <== siblingsLength[i];
    }

    component depthHash[maxDepth];

    // Hash up the elements in the reverse order
    for (var i = maxDepth - 1; i >= 0; i -= 1) {
        depthHash[i] = DepthHasher();

        depthHash[i].isMiddle <== nodeType[i].middle;
        depthHash[i].isLeaf <== nodeType[i].leaf;

        depthHash[i].key <== key;
        depthHash[i].sibling1 <== siblings[2 * i + 1];
        depthHash[i].sibling2 <== siblings[2 * i];
        depthHash[i].directionBit <== directionBits[i];

        depthHash[i].dummy <== dummy;

        if (i != maxDepth - 1) {
            // The accHash of the current depth is the root of the previous depth
            depthHash[i].accHash <== depthHash[i + 1].root;
        } else {
            depthHash[i].accHash <== 0;
        }
    }

    // The root of the merkle tree is the root of the first depth
    depthHash[0].root === root;
}

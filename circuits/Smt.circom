pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/switcher.circom";
include "../node_modules/circomlib/circuits/gates.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

function inverse(a) {
    return 1 - a;
}

/*
 * Hash2 = Poseidon(H_L | H_R)
 */
template Hash2() {
    signal input a;
    signal input b;

    signal output out;

    component h = Poseidon(2);
    h.inputs[0] <== a;
    h.inputs[1] <== b;

    out <== h.out;
}

/*
 * Hash2 = Poseidon(key | value | 1)
 */
template Hash3() {
    signal input a;
    signal input b;
    signal input c;

    signal output out;

    c === 1;

    component h = Poseidon(3);
    h.inputs[0] <== a;
    h.inputs[1] <== b;
    h.inputs[2] <== c;

    out <== h.out;
}

/*
* Returns an array of bits, where the index of `1` bit 
* is the current depth of the tree
*/
template DepthDeterminer(depth) {
    assert(depth > 1); // Do we need this?

    signal input siblings[depth];
    signal output desiredDepth[depth];

    signal done[depth - 1];
    
    component isZero[depth];

    for (var i = 0; i < depth; i++) {
        isZero[i] = IsZero();
        isZero[i].in <== siblings[i];
    }

    isZero[depth - 1].out === 1;

    desiredDepth[depth - 1] <== inverse(isZero[depth - 2].out);
    done[depth - 2] <== desiredDepth[depth - 1];

    for (var i = depth - 2; i > 0; i--) {
        desiredDepth[i] <== inverse(done[i]) * inverse(isZero[i - 1].out);
        done[i - 1] <== desiredDepth[i] + done[i];
    }

    desiredDepth[0] <== inverse(done[0]);
}

// Determines the type of the node
template NodeTypeDeterminer() {
    signal input auxIsEmpty;
    signal input isDesiredDepth;
    signal input isExclusion;

    signal input previousMiddle;
    signal input previousEmpty;
    signal input previousAuxLeaf;
    signal input previousLeaf;

    signal output middle;
    signal output empty;
    signal output auxLeaf;
    signal output leaf;

    signal leafForExclusionCheck;

    leafForExclusionCheck <== isDesiredDepth * isExclusion;

    // Determine the node as a middle, until get to the desired depth
    middle <== previousMiddle - isDesiredDepth;

    // Determine the node as a leaf, when we are at the desired depth and
    // we check for inclusion
    leaf <== isDesiredDepth - leafForExclusionCheck;

    // Determine the node as an auxLeaf, when we are at the desired depth and
    // we check for exclusion
    auxLeaf <== leafForExclusionCheck * inverse(auxIsEmpty);

    // Determine the node as an empty, when we are at the desired depth and
    // we check for exclusion with an empty node
    empty <== isDesiredDepth * auxIsEmpty;
}

// Get hash at the current depth, based on the type of the node
// If the mode is a empty, then the hash is 0
template DepthHash() {
    signal input isMiddle;
    signal input isAuxLeaf;
    signal input isLeaf;

    signal input sibling;
    signal input auxLeaf;
    signal input leaf;
    signal input currentKeyBit;
    signal input child;

    signal output root;

    component switcher = Switcher();
    switcher.L <== child;
    switcher.R <== sibling;
    // Based on the current key bit, we understand which order to use
    switcher.sel <== currentKeyBit;

    component proofHash = Hash2();
    proofHash.a <== switcher.outL;
    proofHash.b <== switcher.outR;

    signal res[3];
    // hash of the middle node
    res[0] <== proofHash.out * isMiddle;
    // hash of the aux leaf node for the exclusion proof
    res[1] <== auxLeaf * isAuxLeaf;
    // hash of the leaf node for the inclusion proof
    res[2] <== leaf * isLeaf;

    // only one of the following will be non-zero
    root <== res[0] + res[1] + res[2];
}


template SMTVerifier(depth) {
    signal input root;
    signal input siblings[depth];

    signal input auxKey;
    signal input auxValue;
    signal input auxIsEmpty;

    signal input key;
    signal input value;

    signal input isExclusion;

    // Check that the auxIsEmpty is 0 if we are checking for inclusion
    component exclusiveCase = AND();
    exclusiveCase.a <== inverse(isExclusion);
    exclusiveCase.b <== auxIsEmpty;
    exclusiveCase.out === 0;

    // Check that the key != auxKey if we are checking for exclusion and the auxIsEmpty is 0
    component areKeyEquals = IsEqual();
    areKeyEquals.in[0] <== auxKey;
    areKeyEquals.in[1] <== key;

    component keysOk = MultiAND(3);
    keysOk.in[0] <== isExclusion;
    keysOk.in[1] <== inverse(auxIsEmpty);
    keysOk.in[2] <== areKeyEquals.out;
    keysOk.out === 0;

    component auxHash = Hash3();
    auxHash.a <== auxKey;
    auxHash.b <== auxValue;
    auxHash.c <== 1;

    component hash = Hash3();
    hash.a <== key;
    hash.b <== value;
    hash.c <== 1;

    component keyBits = Num2Bits_strict();
    keyBits.in <== key;

    component depths = DepthDeterminer(depth);
    for (var i = 0; i < depth; i++) {
        depths.siblings[i] <== siblings[i];
    }

    component nodeType[depth];
    for (var i = 0; i < depth; i++) {
        nodeType[i] = NodeTypeDeterminer();

        if (i == 0) {
            nodeType[i].previousMiddle <== 1;
            nodeType[i].previousEmpty <== 0;
            nodeType[i].previousLeaf <== 0;
            nodeType[i].previousAuxLeaf <== 0;
        } else {
            nodeType[i].previousMiddle <== nodeType[i - 1].middle;
            nodeType[i].previousEmpty <== nodeType[i - 1].empty;
            nodeType[i].previousLeaf <== nodeType[i - 1].leaf;
            nodeType[i].previousAuxLeaf <== nodeType[i - 1].auxLeaf;
        }

        nodeType[i].auxIsEmpty <== auxIsEmpty;
        nodeType[i].isExclusion <== isExclusion;
        nodeType[i].isDesiredDepth <== depths.desiredDepth[i];
    }

    component depthHash[depth];
    for (var i = depth - 1; i >= 0; i--) {
        depthHash[i] = DepthHash();

        depthHash[i].isMiddle <== nodeType[i].middle;
        depthHash[i].isLeaf <== nodeType[i].leaf;
        depthHash[i].isAuxLeaf <== nodeType[i].auxLeaf;

        depthHash[i].sibling <== siblings[i];
        depthHash[i].auxLeaf <== auxHash.out;
        depthHash[i].leaf <== hash.out;

        depthHash[i].currentKeyBit <== keyBits.out[i];

        if (i == depth - 1) {
            depthHash[i].child <== 0;
        } else {
            depthHash[i].child <== depthHash[i + 1].root;
        }
    }

    depthHash[0].root === root;
}
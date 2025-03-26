pragma circom 2.1.6;

include "../hasher/poseidon/poseidon.circom";
include "../utils/switcher.circom";

/**
 * Hash3 = Poseidon(key | left.merkleHash | right.merkleHash)
 */
template Hash3() {
    signal input a;
    signal input b;
    signal input c;    

    signal output out;

    component h = Poseidon(3);
    h.in[0] <== a;
    h.in[1] <== b;
    h.in[2] <== c;

    out <== h.out;
}

/**
 * Determines the type of the node
 * A leaf here refers to a node with two known siblings, whereas a middle node has one sibling and an accumulated hash
 */
template NodeTypeDeterminer() {
    // 1 if the node is at the desired depth, 0 otherwise
    signal input isDesiredDepth;
    signal input isPreviousMiddle;
    signal input isPreviousLeaf;

    // 1 if the node is a middle node, 0 otherwise
    signal output middle;  
    // 1 if the node is a leaf node, 0 otherwise
    signal output leaf;

    // Determine the node as a leaf when we are at the desired depth
    // and the previous node is neither a leaf nor a middle node
    leaf <== isDesiredDepth - isPreviousLeaf - isPreviousMiddle;
    // Determine the node is a middle node when we are at the desired depth 
    // and the current node is not a leaf
    middle <== isDesiredDepth * (1 - leaf);
}

/**
 * Gets hash at the current depth, based on the type of the node
 */
template DepthHasher() {
    signal input isMiddle;
    signal input isLeaf;
    // 0 if looking for inclusion, 1 otherwise
    signal input isExclusionLeaf;

    signal input key;
    signal input nonExistenceKey;

    // this is a key in case of middle node
    signal input sibling1;
    signal input sibling2;

    signal input directionBit;
    signal input accHash;

    signal output root;

    component keySwitcher = Switcher();
    keySwitcher.in[0] <== key;
    keySwitcher.in[1] <== nonExistenceKey;
    keySwitcher.bool <== isExclusionLeaf;

    component leafSwitcher = Switcher();
    leafSwitcher.in[0] <== sibling1;
    leafSwitcher.in[1] <== sibling2;
    // directionBit is 0 if sibling1 <= sibling2, 1 otherwise
    leafSwitcher.bool <== directionBit;

    component leafHash = Hash3();
    leafHash.a <== keySwitcher.out[0];
    leafHash.b <== leafSwitcher.out[0];
    leafHash.c <== leafSwitcher.out[1];

    component middleSwitcher = Switcher();
    middleSwitcher.in[0] <== accHash;
    middleSwitcher.in[1] <== sibling2;
    // directionBit is 0 if accHash <= sibling2, 1 otherwise
    middleSwitcher.bool <== directionBit;

    component middleHash = Hash3();
    middleHash.a <== sibling1;
    middleHash.b <== middleSwitcher.out[0];
    middleHash.c <== middleSwitcher.out[1];

    signal res[2];
    // Hash of the leaf node
    res[0] <== leafHash.out * isLeaf;

    // Hash of the middle node
    res[1] <== middleHash.out * isMiddle;

    // Only one of the following will be non-zero
    root <== res[0] + res[1];
}

template CartesianMerkleTree(proofSize) {
    signal input root;
    signal input siblings[proofSize];

    var maxDepth = proofSize / 2;

    // siblingsLength[i] is 1 if the i-th pair of siblings exists, 0 otherwise
    signal input siblingsLength[maxDepth];
    signal input directionBits[maxDepth];

    signal input key;
    signal input nonExistenceKey;

    signal input isExclusion;

    component nodeType[maxDepth];

    // Start with the leaf
    for (var i = maxDepth - 1; i >= 0; i--) {
        nodeType[i] = NodeTypeDeterminer();

        if (i == maxDepth - 1) {
            nodeType[i].isPreviousMiddle <== 0;
            nodeType[i].isPreviousLeaf <== 0;
        } else {
            nodeType[i].isPreviousMiddle <== nodeType[i + 1].middle;
            nodeType[i].isPreviousLeaf <== nodeType[i + 1].leaf;
        }

        nodeType[i].isDesiredDepth <== siblingsLength[i];
    }

    component depthHash[maxDepth];

    // Hash up the elements in the reverse order
    for (var i = maxDepth - 1; i >= 0; i--) {
        depthHash[i] = DepthHasher();

        depthHash[i].isMiddle <== nodeType[i].middle;
        depthHash[i].isLeaf <== nodeType[i].leaf;
        depthHash[i].isExclusionLeaf <== isExclusion;

        depthHash[i].key <== key;
        depthHash[i].nonExistenceKey <== nonExistenceKey;
        depthHash[i].sibling1 <== siblings[2 * i];
        depthHash[i].sibling2 <== siblings[2 * i + 1];
        depthHash[i].directionBit <== directionBits[i];

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

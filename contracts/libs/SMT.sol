// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {PoseidonFacade} from "@iden3/contracts/lib/Poseidon.sol";

library SparseMerkleTree {
    uint256 internal constant MAX_DEPTH_HARD_CAP = 256;

    enum NodeType {
        EMPTY,
        LEAF,
        MIDDLE
    }

    struct UintSMT {
        mapping(uint256 => Node) nodes;
        uint256 merkleRoot;
        uint128 maxDepth;
        bool initialized;
    }

    struct Proof {
        uint256 root;
        uint256[] siblings;
        bool existence;
        uint256 index;
        uint256 value;
        bool auxExistence;
        uint256 auxIndex;
        uint256 auxValue;
    }

    struct Node {
        NodeType nodeType;
        uint256 childLeft;
        uint256 childRight;
        uint256 index;
        uint256 value;
    }

    modifier onlyInitialized(UintSMT storage self) {
        require(_isInitialized(self), "Smt is not initialized");
        _;
    }

    function initialize(UintSMT storage self, uint128 maxDepth_) internal {
        require(!_isInitialized(self), "Smt is already initialized");

        setMaxDepth(self, maxDepth_);
        self.initialized = true;
    }

    function setMaxDepth(UintSMT storage self, uint128 maxDepth_) internal {
        require(maxDepth_ > 0, "Max depth must be greater than zero");
        require(maxDepth_ > self.maxDepth, "Max depth can only be increased");
        require(
            maxDepth_ <= MAX_DEPTH_HARD_CAP,
            "Max depth is greater than hard cap"
        );

        self.maxDepth = maxDepth_;
    }

    function add(
        UintSMT storage self,
        uint256 index_,
        uint256 value_
    ) internal onlyInitialized(self) {
        Node memory node_ = Node({
            nodeType: NodeType.LEAF,
            childLeft: 0,
            childRight: 0,
            index: index_,
            value: value_
        });

        self.merkleRoot = _add(self, node_, root(self), 0);
    }

    function root(
        UintSMT storage self
    ) internal view onlyInitialized(self) returns (uint256) {
        return self.merkleRoot;
    }

    function node(
        UintSMT storage self,
        uint256 nodeHash_
    ) internal view returns (Node memory) {
        return self.nodes[nodeHash_];
    }

    function proof(
        UintSMT storage self,
        uint256 index_
    ) internal view returns (Proof memory) {
        uint256 currentRoot_ = root(self);
        uint256[] memory siblings_ = new uint256[](self.maxDepth);

        Proof memory proof_ = Proof({
            root: currentRoot_,
            siblings: siblings_,
            existence: false,
            index: index_,
            value: 0,
            auxExistence: false,
            auxIndex: 0,
            auxValue: 0
        });

        uint256 nextNodeHash_ = currentRoot_;
        Node memory node_;

        for (uint256 i = 0; i <= self.maxDepth; i++) {
            node_ = node(self, nextNodeHash_);

            if (node_.nodeType == NodeType.EMPTY) {
                break;
            } else if (node_.nodeType == NodeType.LEAF) {
                if (node_.index == proof_.index) {
                    proof_.existence = true;
                    proof_.value = node_.value;
                    break;
                } else {
                    proof_.auxExistence = true;
                    proof_.auxIndex = node_.index;
                    proof_.auxValue = node_.value;
                    proof_.value = node_.value;
                    break;
                }
            } else if (node_.nodeType == NodeType.MIDDLE) {
                if ((proof_.index >> i) & 1 == 1) {
                    nextNodeHash_ = node_.childRight;
                    proof_.siblings[i] = node_.childLeft;
                } else {
                    nextNodeHash_ = node_.childLeft;
                    proof_.siblings[i] = node_.childRight;
                }
            }
        }

        return proof_;
    }

    function getMaxDepth(UintSMT storage self) internal view returns (uint256) {
        return self.maxDepth;
    }

    function _add(
        UintSMT storage self,
        Node memory newLeaf_,
        uint256 nodeHash_,
        uint256 depth_
    ) private returns (uint256) {
        require(depth_ <= self.maxDepth, "Max depth reached");

        Node memory node_ = self.nodes[nodeHash_];
        uint256 nextNodeHash_;
        uint256 leafHash_;

        if (node_.nodeType == NodeType.EMPTY) {
            leafHash_ = _addNode(self, newLeaf_);
        } else if (node_.nodeType == NodeType.LEAF) {
            leafHash_ = node_.index == newLeaf_.index
                ? _addNode(self, newLeaf_)
                : _pushLeaf(self, newLeaf_, node_, depth_);
        } else if (node_.nodeType == NodeType.MIDDLE) {
            Node memory newNodeMiddle;

            if ((newLeaf_.index >> depth_) & 1 == 1) {
                nextNodeHash_ = _add(
                    self,
                    newLeaf_,
                    node_.childRight,
                    depth_ + 1
                );

                newNodeMiddle = Node({
                    nodeType: NodeType.MIDDLE,
                    childLeft: node_.childLeft,
                    childRight: nextNodeHash_,
                    index: 0,
                    value: 0
                });
            } else {
                nextNodeHash_ = _add(
                    self,
                    newLeaf_,
                    node_.childLeft,
                    depth_ + 1
                );

                newNodeMiddle = Node({
                    nodeType: NodeType.MIDDLE,
                    childLeft: nextNodeHash_,
                    childRight: node_.childRight,
                    index: 0,
                    value: 0
                });
            }

            leafHash_ = _addNode(self, newNodeMiddle);
        }

        return leafHash_;
    }

    function _pushLeaf(
        UintSMT storage self,
        Node memory newLeaf_,
        Node memory oldLeaf_,
        uint256 depth_
    ) private returns (uint256) {
        require(depth_ < self.maxDepth, "Max depth reached");

        Node memory newNodeMiddle_;
        bool newLeafBitAtDepth_ = (newLeaf_.index >> depth_) & 1 == 1;
        bool oldLeafBitAtDepth_ = (oldLeaf_.index >> depth_) & 1 == 1;

        // Check if we need to go deeper if diverge at the depth's bit
        if (newLeafBitAtDepth_ == oldLeafBitAtDepth_) {
            uint256 nextNodeHash_ = _pushLeaf(
                self,
                newLeaf_,
                oldLeaf_,
                depth_ + 1
            );

            if (newLeafBitAtDepth_) {
                // go right
                newNodeMiddle_ = Node(NodeType.MIDDLE, 0, nextNodeHash_, 0, 0);
            } else {
                // go left
                newNodeMiddle_ = Node(NodeType.MIDDLE, nextNodeHash_, 0, 0, 0);
            }

            return _addNode(self, newNodeMiddle_);
        }

        if (newLeafBitAtDepth_) {
            newNodeMiddle_ = Node({
                nodeType: NodeType.MIDDLE,
                childLeft: _getNodeHash(oldLeaf_),
                childRight: _getNodeHash(newLeaf_),
                index: 0,
                value: 0
            });
        } else {
            newNodeMiddle_ = Node({
                nodeType: NodeType.MIDDLE,
                childLeft: _getNodeHash(newLeaf_),
                childRight: _getNodeHash(oldLeaf_),
                index: 0,
                value: 0
            });
        }

        _addNode(self, newLeaf_);

        return _addNode(self, newNodeMiddle_);
    }

    function _addNode(
        UintSMT storage self,
        Node memory node_
    ) private returns (uint256) {
        uint256 nodeHash_ = _getNodeHash(node_);

        if (self.nodes[nodeHash_].nodeType != NodeType.EMPTY) {
            assert(self.nodes[nodeHash_].nodeType == node_.nodeType);
            assert(self.nodes[nodeHash_].childLeft == node_.childLeft);
            assert(self.nodes[nodeHash_].childRight == node_.childRight);
            assert(self.nodes[nodeHash_].index == node_.index);
            assert(self.nodes[nodeHash_].value == node_.value);

            return nodeHash_;
        }

        self.nodes[nodeHash_] = node_;

        return nodeHash_;
    }

    function _getNodeHash(Node memory node_) private pure returns (uint256) {
        uint256 nodeHash_;

        if (node_.nodeType == NodeType.LEAF) {
            nodeHash_ = PoseidonFacade.poseidon3(
                [node_.index, node_.value, uint256(1)]
            );
        } else if (node_.nodeType == NodeType.MIDDLE) {
            nodeHash_ = PoseidonFacade.poseidon2(
                [node_.childLeft, node_.childRight]
            );
        }

        return nodeHash_; // Note: expected to return 0 if NodeType.EMPTY, which is the only option left
    }

    function _isInitialized(UintSMT storage self) private view returns (bool) {
        return self.initialized;
    }
}

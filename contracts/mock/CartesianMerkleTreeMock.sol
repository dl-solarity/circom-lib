// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {PoseidonFacade} from "@iden3/contracts/lib/Poseidon.sol";

import {CartesianMerkleTree} from "@solarity/solidity-lib/libs/data-structures/CartesianMerkleTree.sol";

contract CartesianMerkleTreeMock {
    using CartesianMerkleTree for CartesianMerkleTree.UintCMT;

    CartesianMerkleTree.UintCMT internal _uintTree;

    constructor() {
        _uintTree.initialize(10);
        _uintTree.setHasher(poseidon3);
    }

    function addElement(uint256 key_) external {
        _uintTree.add(key_);
    }

    function getProof(
        uint256 key_,
        uint32 desiredProofSize_
    ) public view returns (CartesianMerkleTree.Proof memory) {
        return _uintTree.getProof(key_, desiredProofSize_);
    }

    function poseidon3(bytes32 el1_, bytes32 el2_, bytes32 el3_) public pure returns (bytes32) {
        return bytes32(PoseidonFacade.poseidon3([uint256(el1_), uint256(el2_), uint256(el3_)]));
    }
}

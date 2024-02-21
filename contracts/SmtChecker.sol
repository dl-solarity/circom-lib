// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {TypeCaster} from "@solarity/solidity-lib/libs/utils/TypeCaster.sol";
import {VerifierHelper} from "@solarity/solidity-lib/libs/zkp/snarkjs/VerifierHelper.sol";

import {SparseMerkleTree} from "./libs/SMT.sol";

contract SmtChecker {
    using SparseMerkleTree for SparseMerkleTree.UintSMT;
    using VerifierHelper for address;
    using TypeCaster for *;

    SparseMerkleTree.UintSMT internal _uintTree;
    address public verifier;

    constructor(address verifier_) {
        _uintTree.initialize(10);
        verifier = verifier_;
    }

    function addElement(uint256 index_, uint256 elem_) external {
        _uintTree.add(index_, elem_);
    }

    function verifyProof(
        uint256 root_,
        VerifierHelper.ProofPoints memory points_
    ) external view returns (bool) {
        require(root_ == getRoot(), "Invalid root");

        return verifier.verifyProof([root_].asDynamic(), points_);
    }

    function getRoot() public view returns (uint256) {
        return _uintTree.root();
    }

    function getProof(
        uint256 index_
    ) public view returns (SparseMerkleTree.Proof memory) {
        return _uintTree.proof(index_);
    }
}

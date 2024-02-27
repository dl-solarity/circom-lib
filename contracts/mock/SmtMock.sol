// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {PoseidonFacade} from "@iden3/contracts/lib/Poseidon.sol";
import {SparseMerkleTree} from "@solarity/solidity-lib/libs/data-structures/SparseMerkleTree.sol";

contract SmtMock {
    using SparseMerkleTree for SparseMerkleTree.UintSMT;

    SparseMerkleTree.UintSMT internal _uintTree;

    constructor() {
        _uintTree.initialize(10);
        _uintTree.setHashers(poseidon2, poseidon3);
    }

    function addElement(uint256 index_, uint256 elem_) external {
        _uintTree.add(index_, elem_);
    }

    function getProof(
        uint256 index_
    ) public view returns (SparseMerkleTree.Proof memory) {
        return _uintTree.getProof(index_);
    }

    function poseidon2(
        bytes32 el1_,
        bytes32 el2_
    ) public pure returns (bytes32) {
        return
            bytes32(PoseidonFacade.poseidon2([uint256(el1_), uint256(el2_)]));
    }

    function poseidon3(
        bytes32 el1_,
        bytes32 el2_,
        bytes32 el3_
    ) public pure returns (bytes32) {
        return
            bytes32(
                PoseidonFacade.poseidon3(
                    [uint256(el1_), uint256(el2_), uint256(el3_)]
                )
            );
    }
}

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Circom Library by Distributed Lab

The library consists of circom circuits that extend the capabilities of [solarity/solidity-lib](https://github.com/dl-solarity/solidity-lib) to be used in magnificent ZK applications.

```md
circuits
├── bigInt
│   ├── bigInt - "BigInt implementation with all the necessary functions"
│   ├── bigIntFunc — "Additional functions to accommodate BigInt"
│   ├── bigIntOverflow — "BigInt implementation with overflow functionality"
│   └── karatsuba — "Karatsuba multiplication for BigInt"
├── bitify
│   ├── bitGates — "Multiple binary gates"
│   ├── bitify — "Convert numbers to bits and vice versa"
│   ├── comparators - "Compare signals in binary representation"
│   └── operations — "Binary sum of multiple elements"
├── blinders
│   └── Commitment — "Commit/reveal scheme implementation"
├── data-structures    
│   └── SparseMerkleTree — "SMT Merkle inclusion/exclusion proofs verification"
├── ec  
│   ├── curve — "Elliptic curve operations"
│   ├── generator - "Generator point getters for supported elliptic curves"
│   └── powers — "Precompute tables for supported elliptic curves"
├── hasher  
│   ├── hash — "Hash functions (sha1, sha224, sha256, sha384, sha512, poseidon)"
│   ├── poseidon - "Poseidon hash function implementation"
│   ├── sha1 — "SHA1 hash function implementation"
│   └── sha2 — "SHA2 hash functions family implementations"
├── int
│   └── arithmetic - "Arithmetic operations over integers" 
├── matrix
│   └── matrix — "Operations for NxM matrices"
├── signatures
│   ├── ecdsa - "ECDSA verification over supported curves"
│   ├── rsa — "RSA-PKCS#1 v1.5 signature verification"
│   ├── rsaPss — "RSASSA-PSS with MGF1 signature verification"
│   └── mask - "Mask generation functions implemetation"
├── utils
│   ├── aliascheck — "Check the number fits the scalar size"
│   └── compconstant — "Compare numbers in binary form"
├── main - "Main components for testing purposes"
└── mock - "Mocks (logs) for testing purposes"
```

Powered by [hardhat-zkit](https://github.com/dl-solarity/hardhat-zkit) circom environment.

## Overview

### Installation

```console
$ npm install @solarity/circom-lib
```

> [!TIP]
> No need to install the Circom compiler, the repository leverages `hardhat-zkit` that does everything for you.

### Compile the circuits

You can compile the circuits in the project by executing the following command:

```console
$ npm run zkit-compile
```

## License

The library is released under the MIT License.

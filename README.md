[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Circom Library by Distributed Lab

The library consists of circom circuits that extend the capabilities of [solarity/solidity-lib](https://github.com/dl-solarity/solidity-lib) to be used in magnificent ZK applications.

- Versatile commitment / nullifier circuit.
- Optimized Sparse Merkle Tree (SMT) data structure.

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

### Create verifier contracts for the circuits

Run the following command in order to generate the solidity verifier contracts:

```console
$ npm run zkit-verifiers
```

## License

The library is released under the MIT License.

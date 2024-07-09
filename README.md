[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Circom Library by Distributed Lab

The library consists of circom circuits that extend the capabilities of [solarity/solidity-lib](https://github.com/dl-solarity/solidity-lib) to be used in magnificent ZK applications.

## Overview

### Installation

```console
$ npm install @solarity/circom-lib
```

### Compile the circuits

You can compile the circuits in the project by executing the following command:

```console
$ npm run zkit-compile
```

> The compilation includes the generation of `r1cs` file, `zkey`, and scripts to produce the corresponding `witnesses`.

### Create verifier contracts for the circuits

Run the following command in order to generate the solidity verifier contracts:

```console
$ npm run zkit-verifiers
```

## License

The library is released under the MIT License.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Circom Library by Distributed Lab

The library consists of circom circuits that extend the capabilities of [solarity/solidity-lib](https://github.com/dl-solarity/solidity-lib) to be used in magnificent ZK applications.

## Overview

### Installation

```console
$ npm install
```

> [!NOTE]
> You will need circom binary preinstalled to be able to compile the circuits.

### Compile all circuits

```console
$ npm run circom-compile
```

or

```console
$ npx hardhat circom:compile
```

### Compile circuit by name

```console
$ npx hardhat circom:compile "smt"
```

### Create verifier contracts for all circuits

```console
$ npm run circom-verifier
```

or

```console
$ npx hardhat circom:verifier
```

### Create verifier contract by circuit name

```console
$ npx hardhat circom:verifier "smt"
```

#

> [!TIP]
> All essential circuit-related information is stored in the `circuit.config.json` file.

## License

The library is released under the MIT License.

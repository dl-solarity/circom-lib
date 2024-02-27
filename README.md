# Circom Library by Distributed Lab

The library consists of common circuits, tests and utilities that facilitate the interaction with the circuits and its' usage.

## Overview

### Installation

```console
$ npm install
```

### Compile all circuits

```console
$ npm run circom-compile
```

or

```console
$ npx hardhat circom:compile
```

### Compile circuit by ID

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

### Create verifier contract by circuit ID

```console
$ npx hardhat circom:verifier "smt"
```

#

> [!TIP]
> All essential circuit-related information is stored in the `circuit.config.json` file.

## License

The library is released under the MIT License.

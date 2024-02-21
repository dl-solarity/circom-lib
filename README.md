# Circom Library by Distributed Lab

The library consists of common circuits, tests and utilities that facilitate the interaction with the circuits and its' usage.

## Overview

### Installation

```console
$ npm install
```

### Compile all circuits

```console
$ npm run circuits-compile
```

or

```console
$ npx hardhat circuits:compile
```

### Compile circuit by ID

```console
$ npx hardhat circuits:compile "mul2"
```

### Create verifier contracts for all circuits

```console
$ npm run circuits-verifier
```

or

```console
$ npx hardhat circuits:verifier
```

### Create verifier contract by circuit ID

```console
$ npx hardhat circuits:verifier "mul2"
```

#

> [!TIP]
> All essential circuit-related information is stored in the `circuit.config.json` file.

## License

The library is released under the MIT License.

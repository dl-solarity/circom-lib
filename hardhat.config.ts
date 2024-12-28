import "@nomicfoundation/hardhat-toolbox";
import "@solarity/hardhat-zkit";
import "@solarity/chai-zkit";
import "tsconfig-paths/register";

import { HardhatUserConfig } from "hardhat/config";

import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.27",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 50,
    enabled: false,
    coinmarketcap: `${process.env.COINMARKETCAP_KEY}`,
  },
  typechain: {
    outDir: "generated-types/ethers",
    target: "ethers-v6",
    alwaysGenerateOverloads: true,
    discriminateTypes: true,
  },
  zkit: {
    compilationSettings: {
      //onlyFiles: [],
      skipFiles: [
        "mock/ec/scalarMult.circom",
        "mock/ec/scalarMultBrainpoolP256r1.circom",
        "mock/signatures/ecdsaBits.circom",
        "mock/signatures/ecdsaNum.circom",
      ],
    },
  },
};

export default config;

import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig, task } from "hardhat/config";
import { compile, createVerifier } from "./scripts/circom";

task("circom:compile", "Compile circuits")
  .addOptionalPositionalParam<string>(
    "circuitIds",
    "Ids of the circuit. If not specified, all circuites will be compiled."
  )
  .setAction(async (args) => {
    console.log(args);
    await compile(args.circuitIds);
  });

task("circom:verifier", "Generate verifier contract")
  .addOptionalPositionalParam<string>(
    "circuitIds",
    "Ids of the circuit. If not specified, verifiers will be created for each curcuit."
  )
  .setAction(async (args) => {
    await createVerifier(args.circuitIds);
  });

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
      },
      {
        version: "0.8.16",
      },
      {
        version: "0.6.11",
      },
    ],
  },
};

export default config;

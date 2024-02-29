import { task } from "hardhat/config";
import { compile, createVerifier, build, clean } from "../scripts/circom";

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

task("circom:build", "copmpile and create verifier contract for circuits")
  .addOptionalPositionalParam<string>(
    "circuitIds",
    "Ids of the circuit. If not specified, verifiers will be created for each curcuit."
  )
  .setAction(async (args) => {
    await build(args.circuitIds);
  });

task(
  "circom:clean",
  "delete all output files from zk-out folder and all verifiers"
).setAction(async (args) => {
  await clean();
});

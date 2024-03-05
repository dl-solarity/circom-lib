import { task } from "hardhat/config";
import { compile, createVerifier, build, clean } from "../scripts/circom";

task("circom:compile", "Compile circuits")
  .addOptionalPositionalParam<string>(
    "circuitIds",
    "Id of a circuit. If not specified, all circuits in the project will be compiled",
  )
  .setAction(async (args) => {
    await compile(args.circuitIds);
  });

task("circom:verifier", "Generate verifier contracts")
  .addOptionalPositionalParam<string>(
    "circuitIds",
    "Id of a circuit. If not specified, verifiers will be created for each circuit in the project",
  )
  .setAction(async (args) => {
    await createVerifier(args.circuitIds);
  });

task("circom:build", "Compile and create verifier contracts for circuits")
  .addOptionalPositionalParam<string>(
    "circuitIds",
    "Id of a circuit. If not specified, verifiers will be created for each circuit in the project",
  )
  .setAction(async (args) => {
    await build(args.circuitIds);
  });

task("circom:clean", "Delete all output files from zk-out folder together with verifiers").setAction(async (args) => {
  await clean();
});

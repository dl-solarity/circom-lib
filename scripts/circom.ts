// @ts-ignore
import * as Logger from "logplease";
import * as fs from "fs";

import { zKey } from "snarkjs";
import { CircomJS } from "@zefi/circomjs";

import config from "../circuit.config.json";

const logger = Logger.create("Distributed Lab", { showTimestamp: false });

const templatePath =
  "./node_modules/snarkjs/templates/verifier_groth16.sol.ejs";
const verifierPath = "./contracts/verifiers";
const outputPath = "./zk-out";

export async function compile(circuitId: string) {
  const circom = new CircomJS();

  const circuits = circuitId?.trim() ? [circuitId] : circom.getCIDs();

  for (const circuitId of circuits) {
    const circuit = circom.getCircuit(circuitId);
    await circuit.compile();
    logger.info(`Circuit is compiled: ${circuitId}`);
  }
}

export async function createVerifier(circuitId: string) {
  const circom = new CircomJS();

  const circuits = circuitId?.trim() ? [circuitId] : circom.getCIDs();

  const groth16Template = await fs.promises.readFile(templatePath, "utf8");

  for (let circuitId of circuits) {
    circuitId = circuitId[0].toLocaleUpperCase() + circuitId.substring(1);

    let verifierCode = (await zKey.exportSolidityVerifier(
      `./zk-out/${circuitId}/circuit_final.zkey`,
      { groth16: groth16Template },
      infoger
    )) as string;

    verifierCode = verifierCode.replace(
      "contract Verifier",
      `contract ${circuitId}Verifier`
    );

    if (!fs.existsSync(verifierPath)) {
      await fs.promises.mkdir(verifierPath, { recursive: true });
    }

    await fs.promises.writeFile(
      `${verifierPath}/${circuitId}Verifier.sol`,
      verifierCode,
      "utf-8"
    );

    console.info(`Verifier is created: ${circuitId}Verifier.sol\n`);
  }
}

export async function build(circuitId: string) {
  await compile(circuitId);
  await createVerifier(circuitId);
}

export async function clean() {
  if (fs.existsSync(verifierPath)) {
    await fs.promises.rm(`${verifierPath}/`, { recursive: true });

    logger.info("Verifiers are cleaned");
  }

  if (fs.existsSync(outputPath)) {
    await fs.promises.rm(`${outputPath}/`, { recursive: true });

    logger.info("Output is cleaned");
  }
}

export async function updateCircuitConfig() {}

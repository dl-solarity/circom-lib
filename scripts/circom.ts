// @ts-ignore
import * as snarkjs from "snarkjs";
// @ts-ignore
import * as Logger from "logplease";
import * as fs from "fs";

import { CircomJS } from "@zefi/circomjs";
import { execSync } from "child_process";

const logger = Logger.create("Distributed Lab", { showTimestamp: false });

export async function compile(circuitId: string) {
  const circom = new CircomJS();

  const circuits = circuitId?.trim() ? [circuitId] : circom.getCIDs();

  for (const circuitId of circuits) {
    const circuit = circom.getCircuit(circuitId);
    await circuit.compile();
  }
}

export async function createVerifier(circuitId: string) {
  const circom = new CircomJS();

  const circuits = circuitId?.trim() ? [circuitId] : circom.getCIDs();

  const groth16Template = await fs.promises.readFile(
    "./node_modules/snarkjs/templates/verifier_groth16.sol.ejs",
    "utf8"
  );

  for (let circuitId of circuits) {
    circuitId = circuitId[0].toLocaleUpperCase() + circuitId.substring(1);

    let verifierCode = (await snarkjs.zKey.exportSolidityVerifier(
      `./zk-out/${circuitId}/circuit_final.zkey`,
      { groth16: groth16Template },
      logger
    )) as string;

    verifierCode = verifierCode.replace(
      "contract Verifier",
      `contract ${circuitId}Verifier`
    );

    await fs.promises.writeFile(
      `./contracts/verifiers/${circuitId}Verifier.sol`,
      verifierCode,
      "utf-8"
    );

    // const result = execSync(
    //   `snarkjs zkey export solidityverifier "./out/${circuitId}/circuit_final.zkey" "./contracts/${verifierName}Verifier.sol"`
    // );

    console.log(`Verifier is created: ${circuitId}Verifier.sol\n`);
  }
}

// @ts-ignore
import * as Logger from "logplease";
import * as fs from "fs";
import path from "path";

import { performance } from "perf_hooks";
import { zKey } from "snarkjs";
import { CircomJS } from "@zefi/circomjs";

import config from "../circuit.config.json";

const logger = Logger.create("Distributed Lab", { showTimestamp: false });

const templatePath: string = path.normalize("./node_modules/snarkjs/templates/verifier_groth16.sol.ejs");

const configPath: string = path.normalize("./circuit.config.json");
const verifierPath: string = path.normalize("./contracts/verifiers");

const outputPath: string = path.normalize(config.outputDir);
const circuitsDir: string = path.normalize(config.build.inputDir);

const zkPath = (circuitId: string) => path.normalize(`./zk-out/${circuitId}/circuit_final.zkey`);

const circuitExtensionName: string = ".circom";

export async function compile(circuitId: string, shouldUpdateConfig = true) {
  shouldUpdateConfig && (await updateCircuitConfig());

  const circom = new CircomJS();
  const circuits = circuitId?.trim() ? [circuitId] : circom.getCIDs();

  for (const circuitId of circuits) {
    const circuit = circom.getCircuit(circuitId);

    const start = performance.now();

    // supressing garbage collection warnings
    const oldErr = console.error;
    console.error = (...data: any[]) => {
      if (data.length > 0 && typeof data[0] == "string" && (<string>data[0]).includes("garbage collection")) {
        return;
      }

      oldErr(data);
    };

    await circuit.compile();

    console.error = oldErr;

    const end = performance.now();

    logger.info(`Circuit is compiled: ${circuitId} for ${((end - start) / 1000).toFixed(2)}s\n`);
  }
}

export async function createVerifier(circuitId: string) {
  const circom = new CircomJS();
  const circuits = circuitId?.trim() ? [circuitId] : circom.getCIDs();
  const groth16Template = await fs.promises.readFile(templatePath, "utf8");

  for (let circuitId of circuits) {
    circuitId = circuitId[0].toLocaleUpperCase() + circuitId.substring(1);

    let verifierCode = (await zKey.exportSolidityVerifier(
      zkPath(circuitId),
      { groth16: groth16Template },
      logger,
    )) as string;

    verifierCode = verifierCode.replace("contract Verifier", `contract ${circuitId}Verifier`);

    if (!fs.existsSync(verifierPath)) {
      await fs.promises.mkdir(verifierPath, { recursive: true });
    }

    await fs.promises.writeFile(`${verifierPath}/${circuitId}Verifier.sol`, verifierCode, "utf-8");

    console.info(`Verifier is created: ${circuitId}Verifier.sol\n`);
  }
}

export async function build(circuitId: string) {
  await compile(circuitId, true);
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

async function updateCircuitConfig() {
  config.build.circuits = [];

  for await (const p of walkOverDir(circuitsDir)) {
    if (path.extname(p).toLocaleLowerCase() === circuitExtensionName) {
      config.build.circuits.push({
        cID: `${path.parse(p).name.replaceAll(" ", "_")}`,
        fileName: path.relative(circuitsDir, p),
        compilationMode: "wasm",
        proofType: "groth16",
      });
    }
  }

  await fs.promises.writeFile(path.normalize(configPath), JSON.stringify(config, null, 2));
}

async function* walkOverDir(dir: string): AsyncGenerator<string, void, unknown> {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);

    if (d.isDirectory()) {
      yield* walkOverDir(entry);
    } else if (d.isFile()) {
      yield entry;
    }
  }
}

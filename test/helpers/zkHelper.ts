import { groth16 } from "snarkjs";
import { Calldata, ProofStruct } from "./types";

export async function generateCallData(proofStruct: ProofStruct) {
  let calldata = await groth16.exportSolidityCallData(
    proofStruct.proof,
    proofStruct.publicSignals
  );

  return JSON.parse(`[${calldata}]`) as Calldata;
}

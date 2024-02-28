import { NumericString } from "snarkjs";

export type PublicSignals = [NumericString];

export type Groth16Proof = {
  pi_a: [NumericString, NumericString];
  pi_b: [[NumericString, NumericString], [NumericString, NumericString]];
  pi_c: [NumericString, NumericString];
  protocol: string;
  curve: string;
};

export type Calldata = [
  [NumericString, NumericString],
  [[NumericString, NumericString], [NumericString, NumericString]],
  [NumericString, NumericString],
  [NumericString]
];

export type ProofStruct = {
  proof: Groth16Proof;
  publicSignals: PublicSignals;
};

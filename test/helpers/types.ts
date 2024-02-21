import { BigNumberish } from "ethers";

export type PublicSignals = [BigNumberish];

export type Groth16Proof = {
  pi_a: [BigNumberish, BigNumberish];
  pi_b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]];
  pi_c: [BigNumberish, BigNumberish];
  protocol: string;
  curve: string;
};

export type Calldata = [
  [BigNumberish, BigNumberish],
  [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
  [BigNumberish, BigNumberish],
  [BigNumberish]
];

export type ProofStruct = {
  proof: Groth16Proof;
  publicSignals: PublicSignals;
};

import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";
import { bigIntToArray } from "../helpers/helperFunctions";

import {
  BigModGroth16Verifier,
  BigModNonEqualGroth16Verifier,
  BigMultModPGroth16Verifier,
  BigMultModPNonEqualGroth16Verifier,
} from "@/generated-types/ethers";

import { BigMod, BigModNonEqual, BigMultModP, BigMultModPNonEqual } from "@/generated-types/zkit";

async function testMod(input1: bigint, input2: bigint, circuit: BigMod) {
  let input = [bigIntToArray(64, 8, input1), bigIntToArray(64, 4, input2)];

  let real_result = bigIntToArray(64, 4, input1 % input2);

  const w = await circuit.calculateWitness({ base: input[0], modulus: input[1], dummy: 0n });

  let circuit_result = w.slice(1 + 5, 1 + 5 + 4);

  for (var i = 0; i < 4; i++) {
    expect(circuit_result[i]).to.be.eq(real_result[i], `${input1} % ${input2}, equal`);
  }

  const proofStruct = await circuit.generateProof({ base: input[0], modulus: input[1], dummy: 0n });

  return proofStruct;
}

async function testModNonEqual(input1: bigint, input2: bigint, circuit: BigModNonEqual) {
  let input = [bigIntToArray(64, 6, input1), bigIntToArray(64, 4, input2)];

  let real_result = bigIntToArray(64, 4, input1 % input2);

  const w = await circuit.calculateWitness({ base: input[0], modulus: input[1], dummy: 0n });

  let circuit_result = w.slice(1 + 3, 1 + 3 + 4);

  for (var i = 0; i < 4; i++) {
    expect(circuit_result[i]).to.be.eq(real_result[i], `${input1} % ${input2}, non equal`);
  }

  const proofStruct = await circuit.generateProof({ base: input[0], modulus: input[1], dummy: 0n });

  return proofStruct;
}

async function testMultiplyingMod(input1: bigint, input2: bigint, input3: bigint, circuit: BigMultModP) {
  let input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2), bigIntToArray(64, 4, input3)];

  let real_result = bigIntToArray(64, 4, (input1 * input2) % input3);

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 4);

  for (var i = 0; i < 4; i++) {
    expect(circuit_result[i]).to.be.eq(real_result[i]);
  }

  const proofStruct = await circuit.generateProof({ in: input, dummy: 0n });

  return proofStruct;
}

async function testNonEqualMultiplyingMod(
  input1: bigint,
  input2: bigint,
  input3: bigint,
  circuit: BigMultModPNonEqual,
) {
  let input = [bigIntToArray(64, 6, input1), bigIntToArray(64, 4, input2), bigIntToArray(64, 5, input3)];

  let real_result = bigIntToArray(64, 5, (input1 * input2) % input3);

  const w = await circuit.calculateWitness({ in1: input[0], in2: input[1], modulus: input[2], dummy: 0n });

  let circuit_result = w.slice(1, 1 + 5);

  for (var i = 0; i < 5; i++) {
    expect(circuit_result[i]).to.be.eq(real_result[i], `${input1} * ${input2} % ${input3}`);
  }

  const proofStruct = await circuit.generateProof({ in1: input[0], in2: input[1], modulus: input[2], dummy: 0n });

  return proofStruct;
}

describe("Big mod test", () => {
  const reverter = new Reverter();

  let verifier: BigModGroth16Verifier;
  let circuit: BigMod;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("BigModGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("BigMod");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("15 % 26262817184209173020064851983289930415585458833826032068889457685516668396079", async () => {
    const proof = await testMod(
      15n,
      26262817184209173020064851983289930415585458833826032068889457685516668396079n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 % 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testMod(
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("26262817184209173020064851983289930415585458833826032068889457685516668396079 % 10973087284760918847830945157214812215033080207200058505424032130636", async () => {
    const proof = await testMod(
      26262817184209173020064851983289930415585458833826032068889457685516668396079n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Big mod test (Non Equal)", () => {
  const reverter = new Reverter();

  let verifier: BigModNonEqualGroth16Verifier;
  let circuit: BigModNonEqual;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("BigModNonEqualGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("BigModNonEqual");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("15 % 26262817184209173020064851983289930415585458833826032068889457685516668396079", async () => {
    const proof = await testModNonEqual(
      15n,
      26262817184209173020064851983289930415585458833826032068889457685516668396079n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 % 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testModNonEqual(
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("241883368833227870992582874977381642562670628715654596816240547673056925099527765267934881522933n % 26262817184209173020064851983289930415585458833826032068889457685516668396079", async () => {
    const proof = await testModNonEqual(
      241883368833227870992582874977381642562670628715654596816240547673056925099527765267934881522933n,
      2609173020064851983289930415585458833826032068889457685516668396079n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Big mult mod test", () => {
  const reverter = new Reverter();

  let verifier: BigMultModPGroth16Verifier;
  let circuit: BigMultModP;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("BigMultModPGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("BigMultModP");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("15 * 15 % 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testMultiplyingMod(
      15n,
      15n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("109730872847609188478309451572148122150330802072000585050763249942403213063436 * 109730872847609188478309451572148122150330802072000585050763249942403213063436 % 109730872847609188478309451572148122150330802072000585050763249942403213063436", async () => {
    const proof = await testMultiplyingMod(
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("10973087284760918847830945157214812215033080207200058505076324 * 1097308728476091884783094515721481221503308020720005850507632499424032 % 2626281718420917302006485198328993041558545883382603206888945768559", async () => {
    const proof = await testMultiplyingMod(
      10973087284760918847830945157214812215033080207200058505076324n,
      1097308728476091884783094515721481221503308020720005850507632499424032n,
      2626281718420917302006485198328993041558545883382603206888945768559n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Big mult mod test (NonEqual)", () => {
  const reverter = new Reverter();

  let verifier: BigMultModPNonEqualGroth16Verifier;
  let circuit: BigMultModPNonEqual;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("BigMultModPNonEqualGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("BigMultModPNonEqual");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("15 * 15 % 1526894769500295165194414781268732802329236444379571779649775359021011024767794405099017497566861", async () => {
    const proof = await testNonEqualMultiplyingMod(
      15n,
      15n,
      1526894769500295165194414781268732802329236444379571779649775359021011024767794405099017497566861n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933 * 109730872847609188478309451572148122150330802072000585050763249942403213063436 % 1526894769500295165194414781268732802329236444379571779649775359021011024767794405099017497566861", async () => {
    const proof = await testNonEqualMultiplyingMod(
      24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933n,
      109730872847609188478309451572148122150330802072000585050763249942403213063436n,
      1526894769500295165194414781268732802329236444379571779649775359021011024767794405099017497566861n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933 * 213 % 1526894769500295165194414781268732802329236444379571779649775359021011024767794405099017497566861", async () => {
    const proof = await testNonEqualMultiplyingMod(
      24188336883322787099258287497738164256214809127723913841212670628715654596816240547673056925099527765267934881522933n,
      213n,
      1526894769500295165194414781268732802329236444379571779649775359021011024767794405099017497566861n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

import { expect } from "chai";
import { ethers, zkit, run } from "hardhat";

import { readFileSync } from "fs";
import path = require("path");

import { Reverter } from "../helpers/reverter";
import { bigIntToArray, pointScalarMul } from "../helpers/helperFunctions";

import {
  EllipticCurvePipingerMult,
  EllipticCurveScalarGeneratorMultiplication,
  EllipticCurveScalarPrecomputeMultiplication,
} from "@/generated-types/zkit/core/mock/ec";
import { EllipticCurveScalarGeneratorMultiplication as generatorMultBrainpool } from "@/generated-types/zkit/core/mock/ec/generatorMultBrainpoolP256r1.circom";
import { EllipticCurveScalarPrecomputeMultiplication as precomputeBrainpool } from "@/generated-types/zkit/core/mock/ec/precomputeMultBrainpoolP256r1.circom";
import { EllipticCurvePipingerMult as pipingerMultBrainpool } from "@/generated-types/zkit/core/mock/ec/scalarMultBrainpoolP256r1.circom";

import {
  EllipticCurveScalarGeneratorMultiplication_64_4_0_0_0_0_7_0_0_0_18446744069414583343_18446744073709551615_18446744073709551615_18446744073709551615_Groth16Verifier,
  EllipticCurveScalarPrecomputeMultiplication_64_4_0_0_0_0_7_0_0_0_18446744069414583343_18446744073709551615_18446744073709551615_18446744073709551615_Groth16Verifier,
} from "@/generated-types/ethers";

async function testGenMult(input1: bigint, circuit: EllipticCurveScalarGeneratorMultiplication) {
  const mult = pointScalarMul(
    55066263022277343669578718895168534326250603453777594175500187360389116729240n,
    32670510020758816978083085130507043184471273380659243275938904335757337482424n,
    input1,
    0n,
    115792089237316195423570985008687907853269984665640564039457584007908834671663n,
  );

  const real_result = [bigIntToArray(64, 4, mult.x), bigIntToArray(64, 4, mult.y)];

  await expect(circuit)
    .with.witnessInputs({ scalar: bigIntToArray(64, 4, input1), dummy: 0n })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({ scalar: bigIntToArray(64, 4, input1), dummy: 0n });

  return proofStruct;
}

async function testGenMultBrainpoolP256r1(input1: bigint, circuit: generatorMultBrainpool) {
  const mult = pointScalarMul(
    63243729749562333355292243550312970334778175571054726587095381623627144114786n,
    38218615093753523893122277964030810387585405539772602581557831887485717997975n,
    input1,
    56698187605326110043627228396178346077120614539475214109386828188763884139993n,
    76884956397045344220809746629001649093037950200943055203735601445031516197751n,
  );

  const real_result = [bigIntToArray(64, 4, mult.x), bigIntToArray(64, 4, mult.y)];

  await expect(circuit)
    .with.witnessInputs({ scalar: bigIntToArray(64, 4, input1), dummy: 0n })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    scalar: bigIntToArray(64, 4, input1),
    dummy: 0n,
  });

  return proofStruct;
}

async function testScalarMult(input1: bigint, input2: bigint, input3: bigint, circuit: EllipticCurvePipingerMult) {
  const input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  const mult = pointScalarMul(
    input1,
    input2,
    input3,
    0n,
    115792089237316195423570985008687907853269984665640564039457584007908834671663n,
  );

  const real_result = [bigIntToArray(64, 4, mult.x), bigIntToArray(64, 4, mult.y)];

  await expect(circuit)
    .with.witnessInputs({ in: input, scalar: bigIntToArray(64, 4, input3), dummy: 0n })
    .to.have.witnessOutputs({ out: real_result });
}

async function testScalarMultBrainpoolP256r1(
  input1: bigint,
  input2: bigint,
  input3: bigint,
  circuit: pipingerMultBrainpool,
) {
  const input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  const mult = pointScalarMul(
    input1,
    input2,
    input3,
    56698187605326110043627228396178346077120614539475214109386828188763884139993n,
    76884956397045344220809746629001649093037950200943055203735601445031516197751n,
  );

  const real_result = [bigIntToArray(64, 4, mult.x), bigIntToArray(64, 4, mult.y)];

  await expect(circuit)
    .with.witnessInputs({ in: input, scalar: bigIntToArray(64, 4, input3), dummy: 0n })
    .to.have.witnessOutputs({ out: real_result });
}

async function testPrecomputeMult(
  input1: bigint,
  input2: bigint,
  input3: bigint,
  circuit: EllipticCurveScalarPrecomputeMultiplication,
) {
  const jsonPath = path.join(__dirname, `./precompute.json`);
  const input = JSON.parse(readFileSync(jsonPath, "utf-8"));

  const mult = pointScalarMul(
    input1,
    input2,
    input3,
    0n,
    115792089237316195423570985008687907853269984665640564039457584007908834671663n,
  );

  const real_result = [bigIntToArray(64, 4, mult.x), bigIntToArray(64, 4, mult.y)];

  await expect(circuit)
    .with.witnessInputs({
      scalar: bigIntToArray(64, 4, input3),
      in: [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)],
      dummy: 0n,
      powers: input.powers,
    })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    scalar: bigIntToArray(64, 4, input3),
    in: [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)],
    dummy: 0n,
    powers: input.powers,
  });

  return proofStruct;
}

async function testPrecomputeMultBrainpoolP256r1(
  input1: bigint,
  input2: bigint,
  input3: bigint,
  circuit: precomputeBrainpool,
) {
  const jsonPath = path.join(__dirname, `./precomputeBrainpool.json`);
  const input = JSON.parse(readFileSync(jsonPath, "utf-8"));

  const mult = pointScalarMul(
    input1,
    input2,
    input3,
    56698187605326110043627228396178346077120614539475214109386828188763884139993n,
    76884956397045344220809746629001649093037950200943055203735601445031516197751n,
  );

  const real_result = [bigIntToArray(64, 4, mult.x), bigIntToArray(64, 4, mult.y)];

  await expect(circuit)
    .with.witnessInputs({
      scalar: bigIntToArray(64, 4, input3),
      in: [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)],
      dummy: 0n,
      powers: input.powers,
    })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    scalar: bigIntToArray(64, 4, input3),
    in: [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)],
    dummy: 0n,
    powers: input.powers,
  });

  return proofStruct;
}

describe("Secp256k1 generator multiplication test", function () {
  this.timeout(10000000);
  const reverter = new Reverter();

  let verifier: EllipticCurveScalarGeneratorMultiplication_64_4_0_0_0_0_7_0_0_0_18446744069414583343_18446744073709551615_18446744073709551615_18446744073709551615_Groth16Verifier;
  let circuit: EllipticCurveScalarGeneratorMultiplication;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory(
      "EllipticCurveScalarGeneratorMultiplication_64_4_0_0_0_0_7_0_0_0_18446744069414583343_18446744073709551615_18446744073709551615_18446744073709551615_Groth16Verifier",
    );

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("circuits/mock/ec/generatorMult.circom:EllipticCurveScalarGeneratorMultiplication");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("2 * G", async function () {
    const proof = await testGenMult(2n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("115792089237316195417293883273301227131288926373708328631619254798622859984896 * G", async function () {
    const proof = await testGenMult(
      115792089237316195417293883273301227131288926373708328631619254798622859984896n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("BrainpoolP256r1 generator multiplication test", function () {
  this.timeout(10000000);
  const reverter = new Reverter();

  let verifier: any;
  let circuit: generatorMultBrainpool;

  before("setup", async () => {
    circuit = await zkit.getCircuit(
      "circuits/mock/ec/generatorMultBrainpoolP256r1.circom:EllipticCurveScalarGeneratorMultiplication",
    );

    await circuit.createVerifier("sol", "Brainpool");
    await run("compile");

    const MockVerifier = await ethers.getContractFactory(
      "EllipticCurveScalarGeneratorMultiplicationBrainpoolGroth16Verifier",
    );
    verifier = await MockVerifier.deploy();

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("2 * G", async function () {
    const proof = await testGenMultBrainpoolP256r1(2n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("115792089237316195417293883273301227131288926373708328631619254798622859984896 * G", async function () {
    const proof = await testGenMultBrainpoolP256r1(
      115792089237316195417293883273301227131288926373708328631619254798622859984896n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Scalar point multiplication test", function () {
  //This circuit requires more than 16GB of RAM to generate the ZKey file,
  //so this test is limited to witness testing only
  this.timeout(10000000);
  const reverter = new Reverter();

  let circuit: EllipticCurvePipingerMult;

  before("setup", async () => {
    circuit = await zkit.getCircuit("circuits/mock/ec/scalarMult.circom:EllipticCurvePipingerMult");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("2 * (55066263022277343669578718895168534326250603453777594175500187360389116729240; 32670510020758816978083085130507043184471273380659243275938904335757337482424)", async function () {
    await testScalarMult(
      2n,
      55066263022277343669578718895168534326250603453777594175500187360389116729240n,
      32670510020758816978083085130507043184471273380659243275938904335757337482424n,
      circuit,
    );
  });

  it("115792089237316195417293883273301227131288926373708328631619254798622859984896 * (89565891926547004231252920425935692360644145829622209833684329913297188986597;12158399299693830322967808612713398636155367887041628176798871954788371653930)", async function () {
    await testScalarMult(
      89565891926547004231252920425935692360644145829622209833684329913297188986597n,
      12158399299693830322967808612713398636155367887041628176798871954788371653930n,
      115792089237316195417293883273301227131288926373708328631619254798622859984896n,
      circuit,
    );
  });
});

describe("BrainpoolP256r1 scalar point multiplication test", function () {
  //This circuit requires more than 16GB of RAM to generate the ZKey file,
  //so this test is limited to witness testing only
  this.timeout(10000000);
  const reverter = new Reverter();

  let circuit: pipingerMultBrainpool;

  before("setup", async () => {
    circuit = await zkit.getCircuit("circuits/mock/ec/scalarMultBrainpoolP256r1.circom:EllipticCurvePipingerMult");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("115792089237316195417293883273301227131288926373708328631619254798622859984896 * (52575969560191351534542091466380106041028581718640875237441073011616025668110;24843789797109572893402439557748964186754677981311543350228155441542769376468)", async function () {
    await testScalarMultBrainpoolP256r1(
      52575969560191351534542091466380106041028581718640875237441073011616025668110n,
      24843789797109572893402439557748964186754677981311543350228155441542769376468n,
      115792089237316195417293883273301227131288926373708328631619254798622859984896n,
      circuit,
    );
  });
});

// If you want change this tests, put correct table at precompute.json
describe("Precompute scalar point multiplication test", function () {
  this.timeout(10000000);
  const reverter = new Reverter();

  let verifier: EllipticCurveScalarPrecomputeMultiplication_64_4_0_0_0_0_7_0_0_0_18446744069414583343_18446744073709551615_18446744073709551615_18446744073709551615_Groth16Verifier;
  let circuit: EllipticCurveScalarPrecomputeMultiplication;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory(
      "EllipticCurveScalarPrecomputeMultiplication_64_4_0_0_0_0_7_0_0_0_18446744069414583343_18446744073709551615_18446744073709551615_18446744073709551615_Groth16Verifier",
    );

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit(
      "circuits/mock/ec/precomputeMult.circom:EllipticCurveScalarPrecomputeMultiplication",
    );

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("4 * (55066263022277343669578718895168534326250603453777594175500187360389116729240; 32670510020758816978083085130507043184471273380659243275938904335757337482424)", async function () {
    const proof = await testPrecomputeMult(
      55066263022277343669578718895168534326250603453777594175500187360389116729240n,
      32670510020758816978083085130507043184471273380659243275938904335757337482424n,
      4n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

// If you want change this tests, put correct table at precompute2.json
describe("Precompute scalar point multiplication test BrainpoolP256r1", function () {
  this.timeout(10000000);
  const reverter = new Reverter();

  let verifier: any;
  let circuit: precomputeBrainpool;

  before("setup", async () => {
    circuit = await zkit.getCircuit(
      "circuits/mock/ec/precomputeMultBrainpoolP256r1.circom:EllipticCurveScalarPrecomputeMultiplication",
    );

    await circuit.createVerifier("sol", "Brainpool");
    await run("compile");

    const MockVerifier = await ethers.getContractFactory(
      "EllipticCurveScalarPrecomputeMultiplicationBrainpoolGroth16Verifier",
    );
    verifier = await MockVerifier.deploy();

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("115792089237316195417293883273301227131288926373708328631619254798622859984896n * (52575969560191351534542091466380106041028581718640875237441073011616025668110n; 24843789797109572893402439557748964186754677981311543350228155441542769376468n)", async function () {
    const proof = await testPrecomputeMultBrainpoolP256r1(
      52575969560191351534542091466380106041028581718640875237441073011616025668110n,
      24843789797109572893402439557748964186754677981311543350228155441542769376468n,
      115792089237316195417293883273301227131288926373708328631619254798622859984896n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

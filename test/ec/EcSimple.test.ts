import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";
import { bigIntToArray, pointAdd, pointDouble } from "../helpers/helperFunctions";

import { PointOnCurve } from "@/generated-types/zkit";
import { EllipticCurveAdd, EllipticCurveDouble } from "@/generated-types/zkit/core/mock/ec";
import { EllipticCurveDouble as doubleBrainpool } from "@/generated-types/zkit/core/mock/ec/doubleBrainpoolP256r1.circom";
import { EllipticCurveAdd as addBrainpool } from "@/generated-types/zkit/core/mock/ec/addBrainpoolP256r1.circom";
import {
  EllipticCurveAdd_64_4_0_0_0_0_7_0_0_0_18446744069414583343_18446744073709551615_18446744073709551615_18446744073709551615_Groth16Verifier,
  EllipticCurveAddBrainpoolGroth16Verifier,
  EllipticCurveDouble_64_4_0_0_0_0_7_0_0_0_18446744069414583343_18446744073709551615_18446744073709551615_18446744073709551615_Groth16Verifier,
  EllipticCurveDoubleBrainpoolGroth16Verifier,
  PointOnCurveGroth16Verifier,
} from "@/generated-types/ethers";

function onCurveCheck(x1: bigint, y1: bigint, a: bigint, b: bigint, p: bigint) {
  return (y1 * y1) % p == (x1 * x1 * x1 + a * x1 + b) % p;
}

async function testOnCurve(input1: bigint, input2: bigint, circuit: PointOnCurve) {
  let input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  let real_result = onCurveCheck(
    input1,
    input2,
    0n,
    7n,
    115792089237316195423570985008687907853269984665640564039457584007908834671663n,
  );

  let proofStruct;

  try {
    const w = await circuit.calculateWitness({ in: input, dummy: 0n });

    proofStruct = await circuit.generateProof({ in: input, dummy: 0n });

    if (!real_result) {
      throw new Error(`Expected failure for P(${input1}, ${input2}) not on curve, but it passed.`);
    }
  } catch (err) {
    if (real_result) {
      throw new Error(`Unexpected failure for P(${input1}, ${input2}) on curve.`);
    } else {
      console.log(`Predicted failure for P(${input1}, ${input2}) not on curve correctly handled.`);
    }
  }

  return proofStruct;
}

async function testDouble(input1: bigint, input2: bigint, circuit: EllipticCurveDouble) {
  let input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  let doubled = pointDouble(
    input1,
    input2,
    0n,
    115792089237316195423570985008687907853269984665640564039457584007908834671663n,
  );

  let real_result = bigIntToArray(64, 4, doubled.x).concat(bigIntToArray(64, 4, doubled.y));

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 8);

  for (var i = 0; i < 8; i++) {
    expect(circuit_result[i]).to.be.eq(real_result[i], `double(${input1}; ${input2})`);
  }

  const proofStruct = await circuit.generateProof({ in: input, dummy: 0n });

  return proofStruct;
}

async function testDoubleBrainpoolP256r1(input1: bigint, input2: bigint, circuit: doubleBrainpool) {
  let input = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];

  let doubled = pointDouble(
    input1,
    input2,
    56698187605326110043627228396178346077120614539475214109386828188763884139993n,
    76884956397045344220809746629001649093037950200943055203735601445031516197751n,
  );

  let real_result = bigIntToArray(64, 4, doubled.x).concat(bigIntToArray(64, 4, doubled.y));

  const w = await circuit.calculateWitness({ in: input, dummy: 0n });

  let circuit_result = w.slice(1, 1 + 8);

  for (var i = 0; i < 8; i++) {
    expect(circuit_result[i]).to.be.eq(real_result[i], `BrainpoolP256r1 double(${input1}; ${input2})`);
  }

  const proofStruct = await circuit.generateProof({
    in: input,
    dummy: 0n,
  });

  return proofStruct;
}

async function testAdd(input1: bigint, input2: bigint, input3: bigint, input4: bigint, circuit: EllipticCurveAdd) {
  let added = pointAdd(
    input1,
    input2,
    input3,
    input4,
    115792089237316195423570985008687907853269984665640564039457584007908834671663n,
  );

  let real_result = bigIntToArray(64, 4, added.x!).concat(bigIntToArray(64, 4, added.y!));

  const w = await circuit.calculateWitness({
    in1: [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)],
    in2: [bigIntToArray(64, 4, input3), bigIntToArray(64, 4, input4)],
    dummy: 0n,
  });

  let circuit_result = w.slice(1, 1 + 8);

  for (var i = 0; i < 8; i++) {
    expect(circuit_result[i]).to.be.eq(real_result[i], `add(${input1}; ${input2}) + (${input3}, ${input4})`);
  }

  const proofStruct = await circuit.generateProof({
    in1: [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)],
    in2: [bigIntToArray(64, 4, input3), bigIntToArray(64, 4, input4)],
    dummy: 0n,
  });

  return proofStruct;
}

async function testAddBrainpoolP256r1(
  input1: bigint,
  input2: bigint,
  input3: bigint,
  input4: bigint,
  circuit: addBrainpool,
) {
  let added = pointAdd(
    input1,
    input2,
    input3,
    input4,
    76884956397045344220809746629001649093037950200943055203735601445031516197751n,
  );

  let real_result = bigIntToArray(64, 4, added.x!).concat(bigIntToArray(64, 4, added.y!));

  const w = await circuit.calculateWitness({
    in1: [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)],
    in2: [bigIntToArray(64, 4, input3), bigIntToArray(64, 4, input4)],
    dummy: 0n,
  });

  let circuit_result = w.slice(1, 1 + 8);

  for (var i = 0; i < 8; i++) {
    expect(circuit_result[i]).to.be.eq(real_result[i], `BrainpoolP256r1 double(${input1}; ${input2})`);
  }

  const proofStruct = await circuit.generateProof({
    in1: [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)],
    in2: [bigIntToArray(64, 4, input3), bigIntToArray(64, 4, input4)],
    dummy: 0n,
  });

  return proofStruct;
}

describe("Secp256r1 Add test", function () {
  const reverter = new Reverter();

  let verifier: EllipticCurveAdd_64_4_0_0_0_0_7_0_0_0_18446744069414583343_18446744073709551615_18446744073709551615_18446744073709551615_Groth16Verifier;
  let circuit: EllipticCurveAdd;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory(
      "EllipticCurveAdd_64_4_0_0_0_0_7_0_0_0_18446744069414583343_18446744073709551615_18446744073709551615_18446744073709551615_Groth16Verifier",
    );

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("circuits/mock/ec/add.circom:EllipticCurveAdd");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("G + 2 * G", async function () {
    const proof = await testAdd(
      55066263022277343669578718895168534326250603453777594175500187360389116729240n,
      32670510020758816978083085130507043184471273380659243275938904335757337482424n,
      89565891926547004231252920425935692360644145829622209833684329913297188986597n,
      12158399299693830322967808612713398636155367887041628176798871954788371653930n,
      circuit,
    );
    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("P(112711660439710606056748659173929673102114977341539408544630613555209775888121, 25583027980570883691656905877401976406448868254816295069919888960541586679410) + P(89565891926547004231252920425935692360644145829622209833684329913297188986597, 12158399299693830322967808612713398636155367887041628176798871954788371653930)", async function () {
    const proof = await testAdd(
      112711660439710606056748659173929673102114977341539408544630613555209775888121n,
      25583027980570883691656905877401976406448868254816295069919888960541586679410n,
      89565891926547004231252920425935692360644145829622209833684329913297188986597n,
      12158399299693830322967808612713398636155367887041628176798871954788371653930n,
      circuit,
    );
    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Brainpool Add test", function () {
  const reverter = new Reverter();

  let verifier: EllipticCurveAddBrainpoolGroth16Verifier;
  let circuit: addBrainpool;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("EllipticCurveAddBrainpoolGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("circuits/mock/ec/addBrainpoolP256r1.circom:EllipticCurveAdd");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("G + 2 * G", async function () {
    const proof = await testAddBrainpoolP256r1(
      63243729749562333355292243550312970334778175571054726587095381623627144114786n,
      38218615093753523893122277964030810387585405539772602581557831887485717997975n,
      52575969560191351534542091466380106041028581718640875237441073011616025668110n,
      24843789797109572893402439557748964186754677981311543350228155441542769376468n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Secp256r1 Double test", function () {
  const reverter = new Reverter();

  let verifier: EllipticCurveDouble_64_4_0_0_0_0_7_0_0_0_18446744069414583343_18446744073709551615_18446744073709551615_18446744073709551615_Groth16Verifier;
  let circuit: EllipticCurveDouble;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory(
      "EllipticCurveDouble_64_4_0_0_0_0_7_0_0_0_18446744069414583343_18446744073709551615_18446744073709551615_18446744073709551615_Groth16Verifier",
    );

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("circuits/mock/ec/double.circom:EllipticCurveDouble");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("Secp256r1 G * 2", async function () {
    const proof = await testDouble(
      55066263022277343669578718895168534326250603453777594175500187360389116729240n,
      32670510020758816978083085130507043184471273380659243275938904335757337482424n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("P(89565891926547004231252920425935692360644145829622209833684329913297188986597,12158399299693830322967808612713398636155367887041628176798871954788371653930) * 2", async function () {
    const proof = await testDouble(
      89565891926547004231252920425935692360644145829622209833684329913297188986597n,
      12158399299693830322967808612713398636155367887041628176798871954788371653930n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Brainpool Double test", function () {
  const reverter = new Reverter();

  let verifier: EllipticCurveDoubleBrainpoolGroth16Verifier;
  let circuit: doubleBrainpool;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("EllipticCurveDoubleBrainpoolGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("circuits/mock/ec/doubleBrainpoolP256r1.circom:EllipticCurveDouble");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("Brainpool G * 2", async function () {
    const proof = await testDoubleBrainpoolP256r1(
      63243729749562333355292243550312970334778175571054726587095381623627144114786n,
      38218615093753523893122277964030810387585405539772602581557831887485717997975n,
      circuit,
    );

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Secp256r1 On Curve test", function () {
  const reverter = new Reverter();

  let verifier: PointOnCurveGroth16Verifier;
  let circuit: PointOnCurve;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("PointOnCurveGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("PointOnCurve");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("G on curve", async function () {
    const proof = await testOnCurve(
      55066263022277343669578718895168534326250603453777594175500187360389116729240n,
      32670510020758816978083085130507043184471273380659243275938904335757337482424n,
      circuit,
    );

    if (!proof) {
      throw new Error(`Unexpected failure for proof generation.`);
    }

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("P(89565891926547004231252920425935692360644145829622209833684329913297188986597,12158399299693830322967808612713398636155367887041628176798871954788371653930) on curve", async function () {
    const proof = await testOnCurve(
      89565891926547004231252920425935692360644145829622209833684329913297188986597n,
      12158399299693830322967808612713398636155367887041628176798871954788371653930n,
      circuit,
    );

    if (!proof) {
      throw new Error(`Unexpected failure for proof generation.`);
    }

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("P(89565891926547004231252920425935692360644145829622209833684329913297188986597 + 1,12158399299693830322967808612713398636155367887041628176798871954788371653930 + 1) on curve, should catch error", async function () {
    await testOnCurve(
      89565891926547004231252920425935692360644145829622209833684329913297188986598n,
      12158399299693830322967808612713398636155367887041628176798871954788371653931n,
      circuit,
    );
  });
});

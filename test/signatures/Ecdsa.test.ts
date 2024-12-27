import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";
import { bigIntToArray, modInverse, pointScalarMul, pointAdd } from "../helpers/helperFunctions";

import { VerifyECDSABits, VerifyECDSABigInt } from "@/generated-types/zkit";
import { VerifyECDSABitsGroth16Verifier } from "@/generated-types/ethers";

function bitArrToNum(arr: bigint[]) {
  let res = 0n;

  for (var i = 0; i < arr.length; i++) {
    res += BigInt(arr[i]) * 2n ** (BigInt(arr.length) - 1n - BigInt(i));
  }

  return res;
}

async function testVerNum(
  input1: bigint,
  input2: bigint,
  input3: bigint,
  input4: bigint,
  input5: bigint,
  circuit: VerifyECDSABigInt,
) {
  const pubkey = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];
  const signature = [bigIntToArray(64, 4, input3), bigIntToArray(64, 4, input4)];
  const hashed = bigIntToArray(64, 4, input5);

  let n = 76884956397045344220809746629001649092737531784414529538755519063063536359079n;

  let sinv = modInverse(input4, n);
  let sh = (sinv * input5) % n;
  let sr = (sinv * input3) % n;
  let p1 = pointScalarMul(
    input1,
    input2,
    sr,
    56698187605326110043627228396178346077120614539475214109386828188763884139993n,
    76884956397045344220809746629001649093037950200943055203735601445031516197751n,
  );
  let p2 = pointScalarMul(
    63243729749562333355292243550312970334778175571054726587095381623627144114786n,
    38218615093753523893122277964030810387585405539772602581557831887485717997975n,
    sh,
    56698187605326110043627228396178346077120614539475214109386828188763884139993n,
    76884956397045344220809746629001649093037950200943055203735601445031516197751n,
  );
  let p3 = pointAdd(
    p1.x!,
    p1.y!,
    p2.x!,
    p2.y!,
    76884956397045344220809746629001649093037950200943055203735601445031516197751n,
  );
  let real_result = p3.x == input3;

  try {
    const w = await circuit.calculateWitness({ pubkey: pubkey, signature: signature, hashed: hashed, dummy: 0n });

    if (!real_result) {
      throw new Error(
        `Expected failure for verification (${input1}, ${input2}), (${input3}, ${input4}) ${input5}, but it passed.`,
      );
    }
  } catch (err) {
    if (real_result) {
      throw new Error(`Unexpected failure for verification (${input1}, ${input2}), (${input3}, ${input4}) ${input5}.`);
    } else {
      console.log(`Predicted failure for verification when points are not on curve correctly handled.`);
    }
  }
}

async function testVerBits(
  input1: bigint,
  input2: bigint,
  input3: bigint,
  input4: bigint,
  input5: bigint[],
  circuit: VerifyECDSABits,
) {
  let pubkey = [bigIntToArray(64, 4, input1), bigIntToArray(64, 4, input2)];
  let signature = [bigIntToArray(64, 4, input3), bigIntToArray(64, 4, input4)];
  let hashed = input5;

  let n = 76884956397045344220809746629001649092737531784414529538755519063063536359079n;
  let hn = BigInt(bitArrToNum(input5));
  let sinv = modInverse(input4, n);
  let sh = (sinv * hn) % n;
  let sr = (sinv * input3) % n;
  let p1 = pointScalarMul(
    input1,
    input2,
    sr,
    56698187605326110043627228396178346077120614539475214109386828188763884139993n,
    76884956397045344220809746629001649093037950200943055203735601445031516197751n,
  );
  let p2 = pointScalarMul(
    63243729749562333355292243550312970334778175571054726587095381623627144114786n,
    38218615093753523893122277964030810387585405539772602581557831887485717997975n,
    sh,
    56698187605326110043627228396178346077120614539475214109386828188763884139993n,
    76884956397045344220809746629001649093037950200943055203735601445031516197751n,
  );
  let p3 = pointAdd(
    p1.x!,
    p1.y!,
    p2.x!,
    p2.y!,
    76884956397045344220809746629001649093037950200943055203735601445031516197751n,
  );
  let real_result = p3.x == input3;

  let proofStruct;

  try {
    const w = await circuit.calculateWitness({ pubkey: pubkey, signature: signature, hashed: hashed, dummy: 0n });

    proofStruct = await circuit.generateProof({
      pubkey: pubkey,
      signature: signature,
      hashed: hashed,
      dummy: 0n,
    });

    if (!real_result) {
      throw new Error(
        `Expected failure for verification (${input1}, ${input2}), (${input3}, ${input4}) ${input5}, but it passed.`,
      );
    }
  } catch (err) {
    if (real_result) {
      throw new Error(`Unexpected failure for verification (${input1}, ${input2}), (${input3}, ${input4}) ${input5}.`);
    } else {
      console.log(`Predicted failure for verification when points are not on curve correctly handled.`);
    }
  }

  return proofStruct;
}

describe("Ecdsa num test", function () {
  //This circuit requires more than 16GB of RAM to generate the ZKey file,
  //so this test is limited to witness testing only
  this.timeout(10000000);
  const reverter = new Reverter();

  let circuit: VerifyECDSABigInt;

  before("setup", async () => {
    circuit = await zkit.getCircuit("VerifyECDSABigInt");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("Ver correct signature", async function () {
    await testVerNum(
      31374990377422060663897166666788812921270243020104798068084951911347116539007n,
      41157152733927076370846415947227885284998856909034587685323725392788996793783n,
      41785691604214669431201278410214784582546070760560366208613932232380633581249n,
      45015635295556179986733632766516885633143292479837071894657301025399130399180n,
      53877815096637157910110176920073475792177340572623780182175655462294595163782n,
      circuit,
    );
  });

  it("Ver incorrect signature, should handle failture", async function () {
    await testVerNum(
      31374990377422060663897166666788812921270243020104798068084951911347116539007n,
      41157152733927076370846415947227885284998856909034587685323725392788996793783n,
      41785691604214669431201278410214784582546070760560366208613932232380633581249n,
      45015635295556179986733632766516885633143292479837071894657301025399130399180n,
      53877815096637157910110176920073475792177340572623780182175655462294595163783n,
      circuit,
    );
  });
});

describe("Ecdsa bits test", function () {
  this.timeout(10000000);
  const reverter = new Reverter();

  let verifier: VerifyECDSABitsGroth16Verifier;
  let circuit: VerifyECDSABits;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("VerifyECDSABitsGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("VerifyECDSABits");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("Ver correct signature", async function () {
    const proof = await testVerBits(
      31374990377422060663897166666788812921270243020104798068084951911347116539007n,
      41157152733927076370846415947227885284998856909034587685323725392788996793783n,
      41785691604214669431201278410214784582546070760560366208613932232380633581249n,
      45015635295556179986733632766516885633143292479837071894657301025399130399180n,
      [
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        0n,
        0n,
        1n,
        1n,
        0n,
        0n,
        1n,
        1n,
        1n,
        1n,
        1n,
        1n,
        0n,
        1n,
        1n,
        0n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        0n,
        0n,
        0n,
        1n,
        1n,
        0n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        1n,
        1n,
        1n,
        1n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        0n,
        0n,
        0n,
        0n,
        1n,
        0n,
        0n,
        0n,
        1n,
        0n,
        1n,
        1n,
        0n,
        0n,
        0n,
        0n,
        1n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        1n,
        0n,
        1n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        1n,
        0n,
        1n,
        0n,
        0n,
        0n,
        1n,
        0n,
        1n,
        0n,
        1n,
        0n,
        1n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        0n,
        1n,
        0n,
        1n,
        1n,
        1n,
        1n,
        1n,
        1n,
        1n,
        0n,
        1n,
        0n,
        1n,
        0n,
        0n,
        0n,
        1n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        1n,
        0n,
        1n,
        0n,
        0n,
        1n,
        0n,
        0n,
        0n,
        1n,
        1n,
        1n,
        1n,
        1n,
        1n,
        1n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        0n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        1n,
        1n,
        0n,
        1n,
        1n,
        0n,
        0n,
        1n,
        0n,
        1n,
        0n,
        1n,
        0n,
        1n,
        1n,
        1n,
        1n,
        1n,
        0n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        1n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        0n,
        1n,
        1n,
        0n,
        1n,
        0n,
        0n,
        0n,
        0n,
        1n,
        1n,
        0n,
      ],
      circuit,
    );

    if (!proof) {
      throw new Error(`Unexpected failure for proof generation.`);
    }

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("Ver incorrect signature, should handle failture", async function () {
    await testVerBits(
      31374990377422060663897166666788812921270243020104798068084951911347116539007n,
      41157152733927076370846415947227885284998856909034587685323725392788996793783n,
      41785691604214669431201278410214784582546070760560366208613932232380633581249n,
      45015635295556179986733632766516885633143292479837071894657301025399130399180n,
      [
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        0n,
        0n,
        1n,
        1n,
        0n,
        0n,
        1n,
        1n,
        1n,
        1n,
        1n,
        1n,
        0n,
        1n,
        1n,
        0n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        0n,
        0n,
        0n,
        1n,
        1n,
        0n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        1n,
        1n,
        1n,
        1n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        0n,
        0n,
        0n,
        0n,
        1n,
        0n,
        0n,
        0n,
        1n,
        0n,
        1n,
        1n,
        0n,
        0n,
        0n,
        0n,
        1n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        1n,
        0n,
        1n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        1n,
        0n,
        1n,
        0n,
        0n,
        0n,
        1n,
        0n,
        1n,
        0n,
        1n,
        0n,
        1n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        0n,
        1n,
        0n,
        1n,
        1n,
        1n,
        1n,
        1n,
        1n,
        1n,
        0n,
        1n,
        0n,
        1n,
        0n,
        0n,
        0n,
        1n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        1n,
        0n,
        1n,
        0n,
        0n,
        1n,
        0n,
        0n,
        0n,
        1n,
        1n,
        1n,
        1n,
        1n,
        1n,
        1n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        0n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        1n,
        1n,
        0n,
        1n,
        1n,
        0n,
        0n,
        1n,
        0n,
        1n,
        0n,
        1n,
        0n,
        1n,
        1n,
        1n,
        1n,
        1n,
        0n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        0n,
        1n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        1n,
        1n,
        0n,
        1n,
        0n,
        1n,
        1n,
        0n,
        1n,
        0n,
        0n,
        0n,
        0n,
        1n,
        1n,
        1n,
      ],
      circuit,
    );
  });
});

import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Reverter } from "../helpers/reverter";

import {
  A,
  AND,
  B,
  BUFFER,
  FALSE,
  IMPLY,
  INVIMPLY,
  NAND,
  NIMPLY,
  NINVNIMPLY,
  NOR,
  NOT,
  NOTA,
  NOTB,
  OR,
  TRUE,
  XNOR,
  XOR,
} from "@/generated-types/zkit";

import {
  AGroth16Verifier,
  ANDGroth16Verifier,
  BGroth16Verifier,
  BUFFERGroth16Verifier,
  FALSEGroth16Verifier,
  IMPLYGroth16Verifier,
  INVIMPLYGroth16Verifier,
  NANDGroth16Verifier,
  NIMPLYGroth16Verifier,
  NINVNIMPLYGroth16Verifier,
  NORGroth16Verifier,
  NOTAGroth16Verifier,
  NOTBGroth16Verifier,
  NOTGroth16Verifier,
  ORGroth16Verifier,
  TRUEGroth16Verifier,
  XNORGroth16Verifier,
  XORGroth16Verifier,
} from "@/generated-types/ethers";

async function testA(input1: bigint, input2: bigint, circuit: A) {
  const input = [input1, input2];
  const real_result = input1;

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testAnd(input1: bigint, input2: bigint, circuit: AND) {
  const input = [input1, input2];
  const real_result = input1 * input2;

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testB(input1: bigint, input2: bigint, circuit: B) {
  const input = [input1, input2];
  const real_result = input2;

  await expect(circuit).with.witnessInputs({ in: input }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input,
  });

  return proofStruct;
}

async function testBuffer(input1: bigint, circuit: BUFFER) {
  const real_result = input1;

  await expect(circuit).with.witnessInputs({ in: input1 }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input1,
  });

  return proofStruct;
}

async function testFalse(input1: bigint, input2: bigint, circuit: FALSE) {
  const real_result = 0n;

  await expect(circuit)
    .with.witnessInputs({ in: [input1, input2] })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: [input1, input2],
  });

  return proofStruct;
}

async function testNimply(input1: bigint, input2: bigint, circuit: NIMPLY) {
  const real_result = input1 - input2 + (1n - input1) * input2;

  await expect(circuit)
    .with.witnessInputs({ in: [input1, input2] })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: [input1, input2],
  });

  return proofStruct;
}

async function testImply(input1: bigint, input2: bigint, circuit: IMPLY) {
  const real_result = 1n - input1 + input2 - (1n - input1) * input2;

  await expect(circuit)
    .with.witnessInputs({ in: [input1, input2] })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: [input1, input2],
  });

  return proofStruct;
}

async function testInvImply(input1: bigint, input2: bigint, circuit: INVIMPLY) {
  const real_result = 1n - input2 + input1 - (1n - input2) * input1;

  await expect(circuit)
    .with.witnessInputs({ in: [input1, input2] })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: [input1, input2],
  });

  return proofStruct;
}

async function testNinvImply(input1: bigint, input2: bigint, circuit: NINVNIMPLY) {
  const real_result = input2 - input1 + (1n - input2) * input1;

  await expect(circuit)
    .with.witnessInputs({ in: [input1, input2] })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: [input1, input2],
  });

  return proofStruct;
}

async function testNor(input1: bigint, input2: bigint, circuit: NOR) {
  const real_result = 1n - input1 + input2 + input1 * input2;

  await expect(circuit)
    .with.witnessInputs({ in: [input1, input2] })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: [input1, input2],
  });

  return proofStruct;
}

async function testNot(input1: bigint, circuit: NOT) {
  const real_result = 1n - input1;

  await expect(circuit).with.witnessInputs({ in: input1 }).to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: input1,
  });

  return proofStruct;
}

async function testNotA(input1: bigint, input2: bigint, circuit: NOTA) {
  const real_result = 1n - input1;

  await expect(circuit)
    .with.witnessInputs({ in: [input1, input2] })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: [input1, input2],
  });

  return proofStruct;
}

async function testNotB(input1: bigint, input2: bigint, circuit: NOTB) {
  const real_result = 1n - input2;

  await expect(circuit)
    .with.witnessInputs({ in: [input1, input2] })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: [input1, input2],
  });

  return proofStruct;
}

async function testOr(input1: bigint, input2: bigint, circuit: OR) {
  const real_result = input1 + input2 - input1 * input2;

  await expect(circuit)
    .with.witnessInputs({ in: [input1, input2] })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: [input1, input2],
  });

  return proofStruct;
}

async function testTrue(input1: bigint, input2: bigint, circuit: TRUE) {
  const real_result = 1n;

  await expect(circuit)
    .with.witnessInputs({ in: [input1, input2] })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: [input1, input2],
  });

  return proofStruct;
}

async function testXnor(input1: bigint, input2: bigint, circuit: XNOR) {
  const real_result = 1n - input1 - input2 + 2n * input1 * input2;

  await expect(circuit)
    .with.witnessInputs({ in: [input1, input2] })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: [input1, input2],
  });

  return proofStruct;
}

async function testXor(input1: bigint, input2: bigint, circuit: XOR) {
  const real_result = input1 + input2 - 2n * input1 * input2;

  await expect(circuit)
    .with.witnessInputs({ in: [input1, input2] })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: [input1, input2],
  });

  return proofStruct;
}

async function testNAnd(input1: bigint, input2: bigint, circuit: NAND) {
  const real_result = 1n - input1 * input2;

  await expect(circuit)
    .with.witnessInputs({ in: [input1, input2] })
    .to.have.witnessOutputs({ out: real_result });

  const proofStruct = await circuit.generateProof({
    in: [input1, input2],
  });

  return proofStruct;
}

describe("Buffer test", () => {
  const reverter = new Reverter();

  let verifier: BUFFERGroth16Verifier;
  let circuit: BUFFER;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("BUFFERGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("BUFFER");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("1", async () => {
    const proof = await testBuffer(1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0", async () => {
    const proof = await testBuffer(0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Not test", () => {
  const reverter = new Reverter();

  let verifier: NOTGroth16Verifier;
  let circuit: NOT;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("NOTGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("NOT");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("1", async () => {
    const proof = await testNot(1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0", async () => {
    const proof = await testNot(0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("And test", () => {
  const reverter = new Reverter();

  let verifier: ANDGroth16Verifier;
  let circuit: AND;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("ANDGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("AND");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testAnd(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testAnd(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testAnd(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testAnd(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("False test", () => {
  const reverter = new Reverter();

  let verifier: FALSEGroth16Verifier;
  let circuit: FALSE;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("FALSEGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("FALSE");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testFalse(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testFalse(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testFalse(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testFalse(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("A test", () => {
  const reverter = new Reverter();

  let verifier: AGroth16Verifier;
  let circuit: A;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("AGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("A");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testA(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testA(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testA(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testA(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("B test", () => {
  const reverter = new Reverter();

  let verifier: BGroth16Verifier;
  let circuit: B;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("BGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("B");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testB(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testB(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testB(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testB(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Imply test", () => {
  const reverter = new Reverter();

  let verifier: IMPLYGroth16Verifier;
  let circuit: IMPLY;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("IMPLYGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("IMPLY");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testImply(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testImply(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testImply(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testImply(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("InvImply test", () => {
  const reverter = new Reverter();

  let verifier: INVIMPLYGroth16Verifier;
  let circuit: INVIMPLY;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("INVIMPLYGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("INVIMPLY");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testInvImply(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testInvImply(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testInvImply(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testInvImply(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("NAnd test", () => {
  const reverter = new Reverter();

  let verifier: NANDGroth16Verifier;
  let circuit: NAND;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("NANDGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("NAND");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testNAnd(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testNAnd(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testNAnd(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testNAnd(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Nimply test", () => {
  const reverter = new Reverter();

  let verifier: NIMPLYGroth16Verifier;
  let circuit: NIMPLY;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("NIMPLYGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("NIMPLY");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testNimply(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testNimply(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testNimply(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testNimply(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("NInvImply test", () => {
  const reverter = new Reverter();

  let verifier: NINVNIMPLYGroth16Verifier;
  let circuit: NINVNIMPLY;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("NINVNIMPLYGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("NINVNIMPLY");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testNinvImply(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testNinvImply(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testNinvImply(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testNinvImply(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Nor test", () => {
  const reverter = new Reverter();

  let verifier: NORGroth16Verifier;
  let circuit: NOR;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("NORGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("NOR");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testNor(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testNor(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testNor(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testNor(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("NotA test", () => {
  const reverter = new Reverter();

  let verifier: NOTAGroth16Verifier;
  let circuit: NOTA;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("NOTAGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("NOTA");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testNotA(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testNotA(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testNotA(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testNotA(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("NotB test", () => {
  const reverter = new Reverter();

  let verifier: NOTBGroth16Verifier;
  let circuit: NOTB;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("NOTBGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("NOTB");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testNotB(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testNotB(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testNotB(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testNotB(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Or test", () => {
  const reverter = new Reverter();

  let verifier: ORGroth16Verifier;
  let circuit: OR;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("ORGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("OR");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testOr(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testOr(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testOr(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testOr(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("True test", () => {
  const reverter = new Reverter();

  let verifier: TRUEGroth16Verifier;
  let circuit: TRUE;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("TRUEGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("TRUE");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testTrue(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testTrue(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testTrue(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testTrue(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Xor test", () => {
  const reverter = new Reverter();

  let verifier: XORGroth16Verifier;
  let circuit: XOR;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("XORGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("XOR");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testXor(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testXor(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testXor(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testXor(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

describe("Xnor test", () => {
  const reverter = new Reverter();

  let verifier: XNORGroth16Verifier;
  let circuit: XNOR;

  before("setup", async () => {
    const MockVerifier = await ethers.getContractFactory("XNORGroth16Verifier");

    verifier = await MockVerifier.deploy();
    circuit = await zkit.getCircuit("XNOR");

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("0 0", async () => {
    const proof = await testXnor(0n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 0 ", async () => {
    const proof = await testXnor(1n, 0n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("0 1", async () => {
    const proof = await testXnor(0n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });

  it("1 1 ", async () => {
    const proof = await testXnor(1n, 1n, circuit);

    await expect(circuit).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});

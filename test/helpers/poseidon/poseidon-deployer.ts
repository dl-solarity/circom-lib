import { ethers } from "hardhat";

import { getPoseidon } from "./poseidon-hash";

export async function deployPoseidonFacade() {
  const poseidonUnit6L = await getPoseidon(6);

  const SpongePoseidon = await ethers.getContractFactory("SpongePoseidon", {
    libraries: {
      PoseidonUnit6L: await poseidonUnit6L.getAddress(),
    },
  });

  const spongePoseidon = await SpongePoseidon.deploy();

  const PoseidonFacade = await ethers.getContractFactory("PoseidonFacade", {
    libraries: {
      PoseidonUnit1L: await (await getPoseidon(1)).getAddress(),
      PoseidonUnit2L: await (await getPoseidon(2)).getAddress(),
      PoseidonUnit3L: await (await getPoseidon(3)).getAddress(),
      PoseidonUnit4L: await (await getPoseidon(4)).getAddress(),
      PoseidonUnit5L: await (await getPoseidon(5)).getAddress(),
      PoseidonUnit6L: await poseidonUnit6L.getAddress(),
      SpongePoseidon: await spongePoseidon.getAddress(),
    },
  });

  return await PoseidonFacade.deploy();
}

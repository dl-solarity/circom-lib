import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig, task } from "hardhat/config";
import "./tasks/tasks";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
      },
      {
        version: "0.8.16",
      },
      {
        version: "0.6.11",
      },
    ],
  },
};

export default config;

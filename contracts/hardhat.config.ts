import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as envConfig } from "dotenv";

envConfig()

const INFURA_ETH_KEY = process.env.INFURA_ETH_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${INFURA_ETH_KEY}`,
        blockNumber: 17900797
      }
    }
  }
};

export default config;

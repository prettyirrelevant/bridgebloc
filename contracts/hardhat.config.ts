import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as envConfig } from "dotenv";

envConfig();

export const INFURA_API_KEY = process.env.INFURA_API_KEY;

const PRIVATE_KEY = String(process.env.PRIVATE_KEY);
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      },
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    eth: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    arbitrum: {
      url: `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    arbitrumTestnet: {
      url: `https://arbitrum-goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    avalanche: {
      url: `https://avalanche-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    avalancheTestnet: {
      url: `https://avalanche-fuji.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    zkEVM: { url: "https://zkevm-rpc.com", accounts: [PRIVATE_KEY] },
    zkEVMTestnet: {
      url: "https://rpc.public.zkevm-test.net",
      accounts: [PRIVATE_KEY],
    },
  },
};

export default config;

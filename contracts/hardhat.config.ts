import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as envConfig } from "dotenv";

envConfig();

const INFURA_ETH_KEY = process.env.INFURA_ETH_KEY;

const PRIVATE_KEY = String(process.env.PRIVATE_KEY);
const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${INFURA_ETH_KEY}`,
        blockNumber: 17900797,
      },
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_ETH_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    eth: {
      url: `https://mainnet.infura.io/v3/${INFURA_ETH_KEY}`,
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

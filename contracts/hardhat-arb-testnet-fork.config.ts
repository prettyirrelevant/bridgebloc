import config from "./hardhat.config";

export default {
    ...config,
    networks: {
        hardhat: {
            forking: {
              url: 'https://arbitrum-goerli.publicnode.com',
              blockNumber: 37018971
            },
          },
    }
}
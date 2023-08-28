import config from "./hardhat.config";

export default {
    ...config,
    networks: {
        hardhat: {
            forking: {
              url: 'https://avalanche.public-rpc.com',
              blockNumber: 34453645,
            },
          },
    }
}
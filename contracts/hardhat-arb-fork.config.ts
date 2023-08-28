import config from "./hardhat.config";

export default {
    ...config,
    networks: {
        hardhat: {
            forking: {
              url: 'https://arbitrum-one.public.blastapi.io',
              blockNumber: 125513380,
            },
          },
    }
}
import config from "./hardhat.config";
import { INFURA_API_KEY } from "./hardhat.config";

export default {
    ...config,
    networks: {
        hardhat: {
            forking: {
              url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
              blockNumber: 9586565,
            },
          },
    }
}
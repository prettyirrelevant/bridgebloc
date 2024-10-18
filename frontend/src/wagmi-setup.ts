import { configureChains, createConfig, type Chain } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { InjectedConnector } from 'wagmi/connectors/injected';

import {
  sepolia,
  mainnet,
  polygon,
  optimism,
  optimismSepolia,
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
} from 'wagmi/chains';

export const polygonAmoy = {
  id: 80_002,
  name: 'Polygon Amoy',
  network: 'amoy',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
    public: {
      http: ['https://polygon-amoy.gateway.tenderly.co'],
    },
    alchemy: {
      http: ['https://polygon-amoy.g.alchemy.com/v2'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://amoy.polygonscan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 3127388,
    },
  },
  testnet: true,
} as const satisfies Chain;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    sepolia,
    mainnet,
    polygon,
    polygonAmoy,
    arbitrum,
    base,
    baseSepolia,
    arbitrumSepolia,
    optimism,
    optimismSepolia,
  ],

  [
    // infuraProvider({ apiKey: import.meta.env.VITE_INFURA_API_KEY! }),
    alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_API_KEY! }),
    publicProvider(),
  ],
);

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

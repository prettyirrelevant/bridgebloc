import { configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";
import { InjectedConnector } from "wagmi/connectors/injected";

import {
  goerli,
  mainnet,
  polygon,
  arbitrum,
  avalanche,
  polygonZkEvm,
  avalancheFuji,
  polygonMumbai,
  arbitrumGoerli,
  polygonZkEvmTestnet,
} from "wagmi/chains";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    goerli,
    mainnet,
    polygon,
    arbitrum,
    avalanche,
    polygonZkEvm,
    avalancheFuji,
    polygonMumbai,
    arbitrumGoerli,
    polygonZkEvmTestnet,
  ],

  [
    infuraProvider({ apiKey: import.meta.env.VITE_INFURA_API_KEY! }),
    publicProvider(),
  ]
);

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

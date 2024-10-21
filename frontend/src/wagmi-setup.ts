import { http, createConfig } from 'wagmi';
import { injected, coinbaseWallet } from 'wagmi/connectors';
import {
  mainnet,
  sepolia,
  polygon,
  polygonAmoy,
  optimism,
  optimismSepolia,
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
} from 'wagmi/chains';

export const config = createConfig({
  chains: [
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
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [optimism.id]: http(),
    [optimismSepolia.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
  connectors: [injected(), coinbaseWallet({ preference: 'smartWalletOnly' })],
});

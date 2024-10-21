import './utils/axios';
import './styles/index.scss';
import * as React from 'react';
import { WagmiProvider } from 'wagmi';
import { config } from './wagmi-setup';
import * as ReactDOM from 'react-dom/client';
import { Providers } from './context/Providers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Providers />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);

import "./utils/axios";
import "./styles/index.scss";
import * as React from "react";
import { WagmiConfig } from "wagmi";
import { config } from "./wagmi-setup";
import * as ReactDOM from "react-dom/client";
import { Providers } from "./context/Providers";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <Providers />
    </WagmiConfig>
  </React.StrictMode>
);

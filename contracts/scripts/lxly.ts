import { ethers } from "hardhat";
import { deploymentVariablesDict } from "../config/lxly";

type Network = "testnet" | "mainnet";
type Chain = "eth" | "zkEVM";

async function deploy(network: Network, chain: Chain) {
  const deploymentVariables = deploymentVariablesDict[network][chain];
  const factory = chain == "eth" ? "RollupETHBridge" : "RollupBridge";
  const bridge = await ethers.deployContract(factory, [
    deploymentVariables.supportedDepositTokens,
    deploymentVariables.polygonZkEVMBridge,
    deploymentVariables.counterpartNetwork,
    deploymentVariables.swapRouterAddr,
    deploymentVariables.WETH,
  ]);

  await bridge.waitForDeployment();
  console.log(
    `Rollup Bridge Deployed At: ${bridge.target} Chain: ${chain} Network: ${network}`
  );
}

// deploy("testnet", "zkEVM").catch((error) => console.log(error));
// deploy("mainnet", "eth").catch((error) => console.log(error));

import { ethers } from "hardhat";
import { deploymentVariablesDict } from "../config/lxly";

type Network = "testnet" | "mainnet";
type Chain = "eth" | "zkEVM";

async function deploy(network: Network, chain: Chain) {
  const deploymentVariables = deploymentVariablesDict[network][chain];
  const bridge = await ethers.deployContract("RollupBridge", [
    deploymentVariables.polygonZkEVMBridge,
    deploymentVariables.counterpartNetwork,
    deploymentVariables.swapRouterAddr,
    deploymentVariables.WETH,
  ]);

  await bridge.waitForDeployment();
  console.log(bridge.target);
}

deploy("testnet", "zkEVM").catch((error) => console.log(error));

//zkEVM TestnetAddr= 0x4a0a5D875322De27e170f7c6E3678d47f711A50F

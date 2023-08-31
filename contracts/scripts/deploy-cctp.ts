import hre, { ethers } from "hardhat";
import { getDeploymentVariablesForNetwork } from "../config/cctp";

async function deploy() {
    const network = hre.network.name;
    const deploymentVariable = getDeploymentVariablesForNetwork(network);
    const cctpBridge = await ethers.deployContract(
      "CrossChainBridge", 
      [
        deploymentVariable?.supportedTokens, 
        deploymentVariable?.uniswapRouter, 
        deploymentVariable?.usdcToken, 
        deploymentVariable?.tokenMessenger, 
        deploymentVariable?.messageTransmitter, 
        deploymentVariable?.cctpDomain
      ]
    );
    await cctpBridge.waitForDeployment();

    console.log(`CCTP Bridge Deployed At ${cctpBridge.target} For ${network}`)
}
deploy().catch((error) => console.log(error));

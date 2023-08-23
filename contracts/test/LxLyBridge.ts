import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import ISwapRouter from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";
import IERC20Metadata from "@openzeppelin/contracts/build/contracts/IERC20Metadata.json";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { deploymentVariablesDict } from "../config/lxly";
import { Contract, parseEther, parseUnits } from "ethers";

import bridge from "../artifacts/contracts/LxLy/polygonZKEVMContracts/PolygonZkEVMBridge.sol/PolygonZkEVMBridge.json";

describe("Bridge", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBridge() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const deploymentVariables = deploymentVariablesDict["mainnet"]["eth"];

    const RollupBridge = await ethers.getContractFactory("RollupBridge");
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const rollupBridge = await RollupBridge.deploy(
      deploymentVariables.polygonZkEVMBridge,
      deploymentVariables.counterpartNetwork,
      deploymentVariables.swapRouterAddr,
      deploymentVariables.WETH
    );
    return {
      rollupBridge,
      ...deploymentVariables,
      owner,
      otherAccount,
      zeroAddress,
    };
  }

  describe("Deployment", async () => {
    it("Should set the right bridge address", async function () {
      const { polygonZkEVMBridge, rollupBridge } = await loadFixture(
        deployBridge
      );

      expect(await rollupBridge.polygonZkEVMBridge()).to.equal(
        polygonZkEVMBridge
      );
    });

    it("Should set the right counterpart network", async function () {
      const { counterpartNetwork, rollupBridge } = await loadFixture(
        deployBridge
      );

      expect(await rollupBridge.counterpartNetwork()).to.equal(
        counterpartNetwork
      );
    });

    it("Should set the right swap router address", async function () {
      const { swapRouterAddr, rollupBridge } = await loadFixture(deployBridge);

      expect(await rollupBridge.swapRouter()).to.equal(swapRouterAddr);
    });
    it("Should set the right WETH address", async function () {
      const { WETH, rollupBridge } = await loadFixture(deployBridge);

      expect(await rollupBridge.WETH()).to.equal(WETH);
    });
  });

  describe("Deposit", () => {
    it("Should fail to bridge a token successfully due to wrong amount", async function () {
      const { rollupBridge, otherAccount } = await loadFixture(deployBridge);

      const amount = parseEther("1");
      await expect(
        rollupBridge.bridgeToken(
          otherAccount.address,
          amount,
          "0x0000000000000000000000000000000000000000",
          true
        )
      ).to.be.revertedWith("msg value not equal to amount");
    });

    it("Should  bridge a token successfully", async function () {
      const { rollupBridge, otherAccount, polygonZkEVMBridge, zeroAddress } =
        await loadFixture(deployBridge);
      // 0x7379a261bC347BDD445484A91648Abf4A2BDEe5E
      const recipient = otherAccount.address;
      const bridgeContract = new Contract(
        polygonZkEVMBridge,
        bridge.abi,
        otherAccount
      );

      const amount = parseEther("1");
      const bridgeTxn = rollupBridge.bridgeToken(
        recipient,
        amount,
        zeroAddress,
        true,
        {
          value: amount,
        }
      );
      await expect(bridgeTxn).to.not.be.reverted;
      await expect(bridgeTxn)
        .to.emit(bridgeContract, "BridgeEvent")
        .withArgs(0, 0, zeroAddress, 1, recipient, amount, anyValue, anyValue);
    });

    it("Should  bridge an erc20 token successfully", async function () {
      const {
        rollupBridge,
        otherAccount,
        polygonZkEVMBridge,
        zeroAddress,
        swapRouterAddr,
        owner,
        WETH,
      } = await loadFixture(deployBridge);

      const block = await hre.ethers.provider.getBlock("latest");
      const blockTimestamp = block ? block.timestamp : 0;
      const usdcToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

      const swapRouter = new ethers.Contract(
        swapRouterAddr,
        ISwapRouter.abi,
        owner
      );
      const usdcContract = new ethers.Contract(
        usdcToken,
        IERC20Metadata.abi,
        owner
      );

      const swapAmount = "1";
      let swapParam = {
        tokenIn: WETH,
        tokenOut: usdcToken,
        fee: 500,
        recipient: owner.address,
        deadline: blockTimestamp + 100,
        amountIn: ethers.parseEther(swapAmount),
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
      };
      await swapRouter.exactInputSingle(swapParam, {
        value: ethers.parseEther(swapAmount),
      });
      await swapRouter.refundETH();
      const bridgeContract = new Contract(
        polygonZkEVMBridge,
        bridge.abi,
        otherAccount
      );

      const amount = parseUnits("1", await usdcContract.decimals());
      await usdcContract.approve(await rollupBridge.getAddress(), amount);
      const recipient = otherAccount.address;

      const bridgeTxn = rollupBridge.bridgeToken(
        recipient,
        amount,
        usdcToken,
        true
      );
      await expect(bridgeTxn).to.not.be.reverted;
      await expect(bridgeTxn)
        .to.emit(bridgeContract, "BridgeEvent")
        .withArgs(
          0,
          0,
          "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          1,
          recipient,
          amount,
          anyValue,
          anyValue
        );
    });

    it("Should swap and bridge a token successfully", async function () {
      const { rollupBridge, otherAccount, polygonZkEVMBridge, zeroAddress } =
        await loadFixture(deployBridge);
      const outputToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      const recipient = otherAccount.address;
      const bridgeContract = new Contract(
        polygonZkEVMBridge,
        bridge.abi,
        otherAccount
      );

      const amount = parseEther("1");
      const bridgeTxn = rollupBridge.swapAndBridge(
        zeroAddress,
        outputToken,
        recipient,
        amount,
        500,
        true,
        {
          value: amount,
        }
      );
      await expect(bridgeTxn).to.not.be.reverted;
      await expect(bridgeTxn)
        .to.emit(bridgeContract, "BridgeEvent")
        .withArgs(
          0,
          0,
          outputToken,
          1,
          recipient,
          anyValue,
          anyValue,
          anyValue
        );
    });

    it("Should swap and bridge an erc20 token successfully", async function () {
      const {
        rollupBridge,
        otherAccount,
        polygonZkEVMBridge,
        zeroAddress,
        swapRouterAddr,
        owner,
        WETH,
      } = await loadFixture(deployBridge);

      const block = await hre.ethers.provider.getBlock("latest");
      const blockTimestamp = block ? block.timestamp : 0;
      const usdcToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

      const swapRouter = new ethers.Contract(
        swapRouterAddr,
        ISwapRouter.abi,
        owner
      );
      const usdcContract = new ethers.Contract(
        usdcToken,
        IERC20Metadata.abi,
        owner
      );

      const swapAmount = "1";
      let swapParam = {
        tokenIn: WETH,
        tokenOut: usdcToken,
        fee: 500,
        recipient: owner.address,
        deadline: blockTimestamp + 100,
        amountIn: ethers.parseEther(swapAmount),
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
      };
      await swapRouter.exactInputSingle(swapParam, {
        value: ethers.parseEther(swapAmount),
      });
      await swapRouter.refundETH();
      const bridgeContract = new Contract(
        polygonZkEVMBridge,
        bridge.abi,
        otherAccount
      );

      const amount = parseUnits("1", await usdcContract.decimals());
      await usdcContract.approve(await rollupBridge.getAddress(), amount);
      const recipient = otherAccount.address;
      const outputToken = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
      const bridgeTxn = rollupBridge.swapAndBridge(
        usdcToken,
        outputToken,
        recipient,
        amount,
        3000,
        true
      );

      //   await expect(bridgeTxn).to.not.be.reverted;
      await expect(bridgeTxn)
        .to.emit(bridgeContract, "BridgeEvent")
        .withArgs(
          0,
          0,
          outputToken,
          1,
          recipient,
          anyValue,
          anyValue,
          anyValue
        );
    });
  });
});

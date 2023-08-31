import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
// import ISwapRouter from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";
import ISwapRouter from "../../contracts/config/abi/ISwapRouter.json";
import IERC20Metadata from "@openzeppelin/contracts/build/contracts/IERC20Metadata.json";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { deploymentVariablesDict } from "../config/lxly";
import { Contract, formatEther, parseEther, parseUnits } from "ethers";

import bridge from "../artifacts/contracts/LxLy/polygonZKEVMContracts/PolygonZkEVMBridge.sol/PolygonZkEVMBridge.json";

describe("LXLY Bridge Tests", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBridge() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const deploymentVariables = deploymentVariablesDict["mainnet"]["zkEVM"];

    const RollupBridge = await ethers.getContractFactory("RollupBridge");
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const rollupBridge = await RollupBridge.deploy(
      deploymentVariables.supportedDepositTokens,
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
        rollupBridge.bridge(
          amount,
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000",
          otherAccount.address,
          true
        )
      ).to.be.revertedWith("msg value not equal to amount");
    });

    it("Should  bridge a token successfully", async function () {
      const {
        rollupBridge,
        otherAccount,
        polygonZkEVMBridge,
        zeroAddress,
        owner,
      } = await loadFixture(deployBridge);
      // 0x7379a261bC347BDD445484A91648Abf4A2BDEe5E
      const recipient = otherAccount.address;
      const bridgeContract = new Contract(
        polygonZkEVMBridge,
        bridge.abi,
        otherAccount
      );
      const amount = parseEther("1");
      const swapAmountAfterFee = parseEther("0.97");
      const bridgeAddr = await bridgeContract.getAddress();
      const rollUpAddr = await rollupBridge.getAddress();
      const bridgeTxn = await rollupBridge.bridge(
        amount,
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        otherAccount.address,
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
          zeroAddress,
          0,
          recipient,
          swapAmountAfterFee,
          anyValue,
          anyValue
        );
      await expect(bridgeTxn).to.changeEtherBalances(
        [bridgeAddr, owner, rollUpAddr],
        [
          `${swapAmountAfterFee}`,
          `-${amount.toString()}`,
          `${parseEther("0.03")}`,
        ]
      );
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
      const usdcToken = "0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035";

      const swapRouter = new ethers.Contract(
        swapRouterAddr,
        ISwapRouter,
        // ISwapRouter.abi,
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
        recipient: owner.address,
        deadline: blockTimestamp + 100,
        amountIn: ethers.parseEther(swapAmount),
        amountOutMinimum: 0,
        limitSqrtPrice: 0,
      };
      await swapRouter.exactInputSingle(swapParam, {
        value: ethers.parseEther(swapAmount),
      });
      // await swapRouter.refundETH();
      const bridgeContract = new Contract(
        polygonZkEVMBridge,
        bridge.abi,
        otherAccount
      );

      const amount = parseUnits("1", await usdcContract.decimals());
      const bridgedAmount = parseUnits("0.97", await usdcContract.decimals()); //minus 3% fee
      await usdcContract.approve(await rollupBridge.getAddress(), amount);
      const recipient = otherAccount.address;

      const bridgeTxn = rollupBridge.bridge(
        amount,
        usdcToken,
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //usdc Address on destination
        otherAccount.address,
        true
      );
      const rollUpAddr = await rollupBridge.getAddress();
      await expect(bridgeTxn).to.not.be.reverted;
      await expect(bridgeTxn).to.changeTokenBalances(
        usdcContract,
        [owner.address, polygonZkEVMBridge, rollUpAddr],
        [
          `-${amount.toString()}`,
          `${"0".toString()}`,
          `${(amount - bridgedAmount).toString()}`,
        ]
      );
      await expect(bridgeTxn)
        .to.emit(bridgeContract, "BridgeEvent")
        .withArgs(
          0,
          0,
          "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          0,
          recipient,
          bridgedAmount,
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

      const bridgeTxn = await rollupBridge.bridge(
        amount,
        "0x0000000000000000000000000000000000000000",
        outputToken, //usdc Address on destination
        otherAccount.address,
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
          0,
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
      const usdcToken = "0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035";

      const swapRouter = new ethers.Contract(
        swapRouterAddr,
        ISwapRouter,
        // ISwapRouter.abi,
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
        recipient: owner.address,
        deadline: blockTimestamp + 100,
        amountIn: ethers.parseEther(swapAmount),
        amountOutMinimum: 0,
        limitSqrtPrice: 0,
      };
      await swapRouter.exactInputSingle(swapParam, {
        value: ethers.parseEther(swapAmount),
      });
      // await swapRouter.refundETH();
      const bridgeContract = new Contract(
        polygonZkEVMBridge,
        bridge.abi,
        otherAccount
      );

      const amount = parseUnits("1", await usdcContract.decimals());
      await usdcContract.approve(await rollupBridge.getAddress(), amount);
      const recipient = otherAccount.address;
      const outputToken = "0x0000000000000000000000000000000000000000"; //receive ether
      const bridgeTxn = rollupBridge.bridge(
        amount,
        usdcToken,
        outputToken, //raw eth Address on zkEVM
        otherAccount.address,
        true,
        {
          value: amount,
        }
      );

      //   await expect(bridgeTxn).to.not.be.reverted;
      await expect(bridgeTxn)
        .to.emit(bridgeContract, "BridgeEvent")
        .withArgs(
          0,
          0,
          outputToken,
          0,
          recipient,
          anyValue,
          anyValue,
          anyValue
        );
    });
  });
});

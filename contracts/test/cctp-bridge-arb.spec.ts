import { expect } from "chai";
import { Contract } from "ethers";
import hre, { ethers } from "hardhat";
import ISwapRouter from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";
import IWETH from "../artifacts/contracts/LxLy/interfaces/WETH.sol/IWETH.json";
import IERC20Metadata from "@openzeppelin/contracts/build/contracts/IERC20Metadata.json";
import ITokenMessenger from "../artifacts/contracts/cctp/interfaces/ITokenMessenger.sol/ITokenMessenger.json";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { getDeploymentVariablesForNetwork } from "../config/cctp";


describe("CCTP Bridge Arbitrum Fork Tests", function () {
    let cctpBridge: Contract;
    const deploymentVariable = getDeploymentVariablesForNetwork("arbitrum");
    const UNISWAP_ROUTER = deploymentVariable.uniswapRouter;
    const USDC_ADDRESS = deploymentVariable.usdcToken;
    const WETH_ADDRESS = deploymentVariable.wethToken;
    const TOKEN_MESSENGER = deploymentVariable.tokenMessenger;
    const MESSAGE_TRANSMITTER = deploymentVariable.messageTransmitter;
    const SUPPORTED_TOKENS = deploymentVariable.supportedTokens;
    const CCTP_DOMAIN = deploymentVariable.cctpDomain;

    const caseInsensitiveTokenMessenger = (value: string): boolean => {
        return TOKEN_MESSENGER?.toLowerCase() == value.toLocaleLowerCase()
    }

    const isZeroAddress = (value: string): boolean => {
        return (parseInt(value.slice(2)) == 0)
    }

    beforeEach(async function () {
        // Deploy the cctp bridge
        cctpBridge = await ethers.deployContract("CrossChainBridge", [SUPPORTED_TOKENS, UNISWAP_ROUTER, USDC_ADDRESS, TOKEN_MESSENGER, MESSAGE_TRANSMITTER, CCTP_DOMAIN]);
    });

    it("Test USDC Deposit", async () => {
        const [ _, newSigner ] = await ethers.getSigners();
        const block = await hre.ethers.provider.getBlock('latest');
        const blockTimestamp = block ? block.timestamp : 0;
        const swapRouter = new ethers.Contract(UNISWAP_ROUTER, ISwapRouter.abi, newSigner);
        const usdcContract = new ethers.Contract(USDC_ADDRESS, IERC20Metadata.abi, newSigner);
        const tokenMessengerContract = new ethers.Contract(TOKEN_MESSENGER, ITokenMessenger.abi, newSigner);

        // Step1: Swap ETH For USDC Using UNISWAPROUTER
        const swapAmount = "1";
        let swapParam = {
            tokenIn: WETH_ADDRESS,
            tokenOut: USDC_ADDRESS,
            fee: 3000,
            recipient: newSigner.address,
            deadline: blockTimestamp + 100,
            amountIn: ethers.parseEther(swapAmount),
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        };
        await swapRouter.exactInputSingle(swapParam, {value: ethers.parseEther(swapAmount)});
        await swapRouter.refundETH();

        // Step2: Call the deposit method of cctpbridge to deposit usdc
        const usdcDecimal = await usdcContract.decimals();
        const depositAmount = ethers.parseUnits("100", usdcDecimal);
        const sourceToken = USDC_ADDRESS;
        const destinationToken = USDC_ADDRESS;
        const destinationDomain = 1;
        const recipient = newSigner.address;
        const destinationContract = await cctpBridge.getAddress();
        const initialBalance = ethers.formatUnits(await usdcContract.balanceOf(newSigner.address), usdcDecimal);
        await usdcContract.approve(destinationContract, depositAmount); // Approve CCTPBridge[same as destination contract] to spend depositAmount.
        const depositTxn = await cctpBridge.connect(newSigner).deposit(depositAmount, sourceToken, destinationToken, destinationDomain, recipient, destinationContract);
        const finalBalance = ethers.formatUnits(await usdcContract.balanceOf(newSigner.address), usdcDecimal);
        
        // Step3: Assertions
        const bridgeAddress = await cctpBridge.getAddress();
        const destinationContractBytes32 = await cctpBridge.addressToBytes32(destinationContract);
        expect(parseInt(finalBalance)).to.equal(parseInt(initialBalance) - 100);
        await expect(depositTxn).to.emit(cctpBridge, 'BridgeDepositReceived').withArgs(newSigner.address, recipient, CCTP_DOMAIN.toString(), destinationDomain.toString(), anyValue, depositAmount, USDC_ADDRESS, destinationToken);
        await expect(depositTxn).to.emit(usdcContract, 'Transfer').withArgs(newSigner.address, bridgeAddress, depositAmount);
        await expect(depositTxn).to.emit(usdcContract, 'Approval').withArgs(bridgeAddress, caseInsensitiveTokenMessenger, depositAmount);
        await expect(depositTxn).to.emit(tokenMessengerContract, 'DepositForBurn').withArgs(anyValue, USDC_ADDRESS, depositAmount, bridgeAddress, destinationContractBytes32, destinationDomain, anyValue, isZeroAddress);        
    });

    it("Test WETH Deposit", async () => {
        const [ _, newSigner ] = await ethers.getSigners();
        const wethContract = new ethers.Contract(WETH_ADDRESS, IWETH.abi, newSigner);
        const usdcContract = new ethers.Contract(USDC_ADDRESS, IERC20Metadata.abi, newSigner);
        const tokenMessengerContract = new ethers.Contract(TOKEN_MESSENGER, ITokenMessenger.abi, newSigner);

        // Step1: Deposit ETH for WETH 
        const wrapAmount = "1";
        await wethContract.deposit({value: ethers.parseEther(wrapAmount)});

        // Step2: Call the deposit method of cctpbridge to deposit weth
        const depositAmount = ethers.parseUnits("1", 18);
        const sourceToken = WETH_ADDRESS;
        const destinationToken = USDC_ADDRESS;
        const destinationDomain = 1;
        const recipient = newSigner.address;
        const destinationContract = await cctpBridge.getAddress();
        const initialBalance = ethers.formatUnits(await wethContract.balanceOf(newSigner.address), 18);
        await wethContract.approve(destinationContract, depositAmount); // Approve CCTPBridge[same as destination contract] to spend depositAmount.
        const depositTxn = await cctpBridge.connect(newSigner).deposit(depositAmount, sourceToken, destinationToken, destinationDomain, recipient, destinationContract);
        const finalBalance = ethers.formatUnits(await wethContract.balanceOf(newSigner.address), 18);
        
        // Step3: Assertions
        const bridgeAddress = await cctpBridge.getAddress();
        const destinationContractBytes32 = await cctpBridge.addressToBytes32(destinationContract);
        expect(parseInt(finalBalance)).to.equal(parseInt(initialBalance) - 1);
        await expect(depositTxn).to.emit(cctpBridge, 'BridgeDepositReceived').withArgs(newSigner.address, recipient, CCTP_DOMAIN.toString(), destinationDomain.toString(), anyValue, anyValue, WETH_ADDRESS, destinationToken);
        await expect(depositTxn).to.emit(wethContract, 'Transfer').withArgs(newSigner.address, bridgeAddress, depositAmount);
        await expect(depositTxn).to.emit(usdcContract, 'Approval').withArgs(bridgeAddress, caseInsensitiveTokenMessenger, anyValue);
        await expect(depositTxn).to.emit(tokenMessengerContract, 'DepositForBurn').withArgs(anyValue, USDC_ADDRESS, anyValue, bridgeAddress, destinationContractBytes32, destinationDomain, anyValue, isZeroAddress);

    });

    it("Test USDT Deposit", async () => {
        const [ _, newSigner ] = await ethers.getSigners();
        const block = await hre.ethers.provider.getBlock('latest');
        const blockTimestamp = block ? block.timestamp : 0;
        const swapRouter = new ethers.Contract(UNISWAP_ROUTER, ISwapRouter.abi, newSigner);
        const usdtContract = new ethers.Contract(deploymentVariable.usdtToken, IERC20Metadata.abi, newSigner);
        const usdcContract = new ethers.Contract(USDC_ADDRESS, IERC20Metadata.abi, newSigner);
        const tokenMessengerContract = new ethers.Contract(TOKEN_MESSENGER, ITokenMessenger.abi, newSigner);
        // Step1: Swap ETH For USDT
        const swapAmount = "1";
        let swapParam = {
            tokenIn: WETH_ADDRESS,
            tokenOut: deploymentVariable.usdtToken,
            fee: 3000,
            recipient: newSigner.address,
            deadline: blockTimestamp + 100,
            amountIn: ethers.parseEther(swapAmount),
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        };
        await swapRouter.exactInputSingle(swapParam, {value: ethers.parseEther(swapAmount)});
        await swapRouter.refundETH();
        // Step2: Call the deposit method of cctpbridge to deposit usdt
        const usdtDecimals = await usdtContract.decimals();
        const depositAmount = ethers.parseUnits("100", usdtDecimals);
        const sourceToken = deploymentVariable.usdtToken;
        const destinationToken = USDC_ADDRESS;
        const destinationDomain = 1;
        const recipient = newSigner.address;
        const destinationContract = await cctpBridge.getAddress();
        const initialBalance = ethers.formatUnits(await usdtContract.balanceOf(newSigner.address), usdtDecimals);
        await usdtContract.approve(destinationContract, depositAmount); // Approve CCTPBridge[same as destination contract] to spend depositAmount.
        const depositTxn = await cctpBridge.connect(newSigner).deposit(depositAmount, sourceToken, destinationToken, destinationDomain, recipient, destinationContract);
        const finalBalance = ethers.formatUnits(await usdtContract.balanceOf(newSigner.address), usdtDecimals);
        
        // Step3: Assertions
        const bridgeAddress = await cctpBridge.getAddress();
        const destinationContractBytes32 = await cctpBridge.addressToBytes32(destinationContract);
        expect(parseInt(finalBalance)).to.equal(parseInt(initialBalance) - parseInt(ethers.formatUnits(depositAmount, usdtDecimals)));
        await expect(depositTxn).to.emit(cctpBridge, 'BridgeDepositReceived').withArgs(newSigner.address, recipient, CCTP_DOMAIN.toString(), destinationDomain.toString(), anyValue, anyValue, deploymentVariable.usdtToken, destinationToken);
        await expect(depositTxn).to.emit(usdtContract, 'Transfer').withArgs(newSigner.address, bridgeAddress, depositAmount);
        await expect(depositTxn).to.emit(usdcContract, 'Approval').withArgs(bridgeAddress, caseInsensitiveTokenMessenger, anyValue);
        await expect(depositTxn).to.emit(tokenMessengerContract, 'DepositForBurn').withArgs(anyValue, USDC_ADDRESS, anyValue, bridgeAddress, destinationContractBytes32, destinationDomain, anyValue, isZeroAddress);
    });

    it("Test DAI Deposit", async () => {
        const [ _, newSigner ] = await ethers.getSigners();
        const block = await hre.ethers.provider.getBlock('latest');
        const blockTimestamp = block ? block.timestamp : 0;
        const swapRouter = new ethers.Contract(UNISWAP_ROUTER, ISwapRouter.abi, newSigner);
        const daiContract = new ethers.Contract(deploymentVariable.daiToken, IERC20Metadata.abi, newSigner);
        const usdcContract = new ethers.Contract(USDC_ADDRESS, IERC20Metadata.abi, newSigner);
        const tokenMessengerContract = new ethers.Contract(TOKEN_MESSENGER, ITokenMessenger.abi, newSigner);
        
        // Step1: Swap ETH For DAI
        const swapAmount = "1";
        let swapParam = {
            tokenIn: WETH_ADDRESS,
            tokenOut: deploymentVariable.daiToken,
            fee: 3000,
            recipient: newSigner.address,
            deadline: blockTimestamp + 100,
            amountIn: ethers.parseEther(swapAmount),
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        };
        await swapRouter.exactInputSingle(swapParam, {value: ethers.parseEther(swapAmount)});
        await swapRouter.refundETH();

        
        // Step2: Call the deposit method of cctpbridge to deposit dai
        const daiDecimals = await daiContract.decimals();
        const depositAmount = ethers.parseUnits("100", daiDecimals);
        const sourceToken = deploymentVariable.daiToken;
        const destinationToken = USDC_ADDRESS;
        const destinationDomain = 1;
        const recipient = newSigner.address;
        const destinationContract = await cctpBridge.getAddress();
        const initialBalance = ethers.formatUnits(await daiContract.balanceOf(newSigner.address), daiDecimals);
        await daiContract.approve(destinationContract, depositAmount); // Approve CCTPBridge[same as destination contract] to spend depositAmount.
        const depositTxn = await cctpBridge.connect(newSigner).deposit(depositAmount, sourceToken, destinationToken, destinationDomain, recipient, destinationContract);
        const finalBalance = ethers.formatUnits(await daiContract.balanceOf(newSigner.address), daiDecimals);
        
        // Step3: Assertions
        const bridgeAddress = await cctpBridge.getAddress();
        const destinationContractBytes32 = await cctpBridge.addressToBytes32(destinationContract);
        expect(parseInt(finalBalance)).to.equal(parseInt(initialBalance) - parseInt(ethers.formatUnits(depositAmount, daiDecimals)));
        await expect(depositTxn).to.emit(cctpBridge, 'BridgeDepositReceived').withArgs(newSigner.address, recipient, CCTP_DOMAIN.toString(), destinationDomain.toString(), anyValue, anyValue, deploymentVariable.daiToken, destinationToken);
        await expect(depositTxn).to.emit(daiContract, 'Transfer').withArgs(newSigner.address, bridgeAddress, depositAmount);
        await expect(depositTxn).to.emit(usdcContract, 'Approval').withArgs(bridgeAddress, caseInsensitiveTokenMessenger, anyValue);
        await expect(depositTxn).to.emit(tokenMessengerContract, 'DepositForBurn').withArgs(anyValue, USDC_ADDRESS, anyValue, bridgeAddress, destinationContractBytes32, destinationDomain, anyValue, isZeroAddress);
    });

    it("Test USDC Withdrawal", async () => {
        const [ admin, newSigner ] = await ethers.getSigners();
        const block = await hre.ethers.provider.getBlock('latest');
        const blockTimestamp = block ? block.timestamp : 0;
        const swapRouter = new ethers.Contract(UNISWAP_ROUTER, ISwapRouter.abi, newSigner);
        const usdcContract = new ethers.Contract(USDC_ADDRESS, IERC20Metadata.abi, newSigner);
        const cctpAddress = await cctpBridge.getAddress();
        const usdcDecimal = await usdcContract.decimals();

        // Step1: Swap ETH For USDC And sent to the bridge contract
        const swapAmount = "1";
        let swapParam = {
            tokenIn: WETH_ADDRESS,
            tokenOut: USDC_ADDRESS,
            fee: 3000,
            recipient: (cctpAddress),
            deadline: blockTimestamp + 100,
            amountIn: ethers.parseEther(swapAmount),
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        };
        await swapRouter.exactInputSingle(swapParam, {value: ethers.parseEther(swapAmount)});
        await swapRouter.refundETH();
        
        // Step2: Call the Withdrawal [Admin]
        const cctpInitialBalance = await usdcContract.balanceOf(cctpAddress);
        const withdrawalAmount = ethers.parseUnits("100", usdcDecimal);
        const depositTxn = await cctpBridge.connect(admin).withdraw(withdrawalAmount);
        await depositTxn.wait()
        const cctpFinalBalance = await usdcContract.balanceOf(cctpAddress);
        
        // Step3: Assertions
        expect(parseInt(cctpFinalBalance.toString())).to.equal(parseInt(cctpInitialBalance.toString()) - parseInt(withdrawalAmount.toString()));

        // Step 4: Call the Withdrawal [Not Admin]
        await expect(cctpBridge.connect(newSigner).withdraw(withdrawalAmount)).to.be.revertedWith("Not Permitted");
    });
})
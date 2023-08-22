import { expect } from "chai";
import { Contract } from "ethers";
import hre, { ethers } from "hardhat";
import ISwapRouter from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";
import IERC20Metadata from "@openzeppelin/contracts/build/contracts/IERC20Metadata.json";
import ITokenMessenger from "../artifacts/contracts/cctp/interfaces/ITokenMessenger.sol/ITokenMessenger.json";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";


describe("CCTP Bridge Tests", function () {
    let cctpBridge: Contract;
    const UNISWAP_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    const TOKEN_MESSENGER = "0xbd3fa81b58ba92a82136038b25adec7066af3155";
    const MESSAGE_TRANSMITTER = "0x0a992d191deec32afe36203ad87d7d289a738f81";
    const SUPPORTED_TOKENS = [{token: USDC_ADDRESS, fee: 3000}]
    const CCTP_DOMAIN = 0;
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    const caseInsensitiveTokenMessenger = (value: string): boolean => {
        return TOKEN_MESSENGER.toLowerCase() == value.toLocaleLowerCase()
    }

    const isZeroAddress = (value: string): boolean => {
        return (parseInt(value.slice(2)) == 0)
    }

    beforeEach(async function () {
        // Deploy the cctp bridge
        cctpBridge = await ethers.deployContract("CrossChainBridge", [SUPPORTED_TOKENS, UNISWAP_ROUTER, USDC_ADDRESS, TOKEN_MESSENGER, MESSAGE_TRANSMITTER, CCTP_DOMAIN]);
    });

    it("confirm every state variable in the smart contract", async function () {
        const [ deployer, _ ] = await ethers.getSigners()
        expect(await cctpBridge.CCTP_DOMAIN()).to.equal(CCTP_DOMAIN);
        expect((await cctpBridge.swapRouter()).toLowerCase()).to.equal(UNISWAP_ROUTER.toLowerCase());
        expect((await cctpBridge.usdcToken()).toLowerCase()).to.equal(USDC_ADDRESS.toLowerCase());
        expect((await cctpBridge.tokenMessenger()).toLowerCase()).to.equal(TOKEN_MESSENGER.toLowerCase());
        expect((await cctpBridge.messageTransmitter()).toLowerCase()).to.equal(MESSAGE_TRANSMITTER);
        expect(await cctpBridge.bridgeAdmins(deployer.address)).to.equal(true);

        for (let token of SUPPORTED_TOKENS) {
            expect((await cctpBridge.supportedTokens(token.token))[0]).to.equal(token.token);
            expect((await cctpBridge.supportedTokens(token.token))[1]).to.equal(token.fee);
        };
    });

    it("Test addition and removal of supported token", async () => {
        const newToken = { token: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", fee: 3000 };
        const res1 = await cctpBridge.supportedTokens(newToken.token);
        expect(res1[0]).to.equal(zeroAddress);
        expect(res1[1]).to.equal(0);
        // Add Token Tests
        await cctpBridge.addToken(newToken.token, newToken.fee);
        const res2 = await cctpBridge.supportedTokens(newToken.token);
        expect(res2[0]).to.equal(newToken.token);
        expect(res2[1]).to.equal(newToken.fee);
        // Remove Token Test
        await cctpBridge.removeToken(newToken.token);
        const res3 = await cctpBridge.supportedTokens(newToken.token);
        expect(res3[0]).to.equal(zeroAddress);
        expect(res3[1]).to.equal(0);
    });

    it("Test Adding and Removing admins", async () => {
        const [ _, newAdmin ] = await ethers.getSigners();
        expect(await cctpBridge.bridgeAdmins(newAdmin.address)).to.equal(false);
        await cctpBridge.addAdmin(newAdmin.address);
        expect(await cctpBridge.bridgeAdmins(newAdmin.address)).to.equal(true);
        await cctpBridge.removeAdmin(newAdmin.address);
        expect(await cctpBridge.bridgeAdmins(newAdmin.address)).to.equal(false);
    });

    it("Test USDC Deposit", async () => {
        // Do the neccesary checks
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
        await expect(depositTxn).to.emit(cctpBridge, 'BridgeDepositReceived').withArgs(CCTP_DOMAIN.toString(), destinationDomain.toString(), anyValue, depositAmount, newSigner.address, recipient, destinationToken);
        await expect(depositTxn).to.emit(usdcContract, 'Transfer').withArgs(newSigner.address, bridgeAddress, depositAmount);
        await expect(depositTxn).to.emit(usdcContract, 'Approval').withArgs(bridgeAddress, caseInsensitiveTokenMessenger, depositAmount);
        await expect(depositTxn).to.emit(tokenMessengerContract, 'DepositForBurn').withArgs(anyValue, USDC_ADDRESS, depositAmount, bridgeAddress, destinationContractBytes32, destinationDomain, anyValue, isZeroAddress);        
    })
})
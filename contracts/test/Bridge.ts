import { expect } from "chai";
import { Contract } from "ethers";
import hre, { ethers } from "hardhat";

describe("CCTP Bridge Tests", function () {
    let cctpBridge: Contract;
    const UNISWAP_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    const TOKEN_MESSENGER = "0xbd3fa81b58ba92a82136038b25adec7066af3155";
    const MESSAGE_TRANSMITTER = "0x0a992d191deec32afe36203ad87d7d289a738f81";
    const SUPPORTED_TOKENS = [{token: USDC_ADDRESS, fee: 3000}]
    const CCTP_DOMAIN = 0;

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
        const zeroAddress = '0x0000000000000000000000000000000000000000';
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

    it("Test Adding and Removing admins",async () => {
        const [ _, newAdmin ] = await ethers.getSigners();
        expect(await cctpBridge.bridgeAdmins(newAdmin.address)).to.equal(false);
        await cctpBridge.addAdmin(newAdmin.address);
        expect(await cctpBridge.bridgeAdmins(newAdmin.address)).to.equal(true);
        await cctpBridge.removeAdmin(newAdmin.address);
        expect(await cctpBridge.bridgeAdmins(newAdmin.address)).to.equal(false);
    });
})
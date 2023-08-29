import { ethers } from 'ethers';
import { ethers as hardhatEthers } from 'hardhat';
import axios from 'axios';
import { config as envConfig } from "dotenv";
import IERC20Metadata from "@openzeppelin/contracts/build/contracts/IERC20Metadata.json";
import IMessageTransmitter from '../artifacts/contracts/cctp/interfaces/IMessageTransmitter.sol/IMessageTransmitter.json';
import { abi } from '../artifacts/contracts/cctp/Bridge.sol/CrossChainBridge.json';
import { deploymentVariables } from '../config/cctp';

envConfig();

// TESTNET BRIDGE CONTRACT ADDRESSES
const CCTP_BRIDGE_ETHEREUM_GOERLI = '0xd5c93ba04fb427aeb13d04bc76df77dfceebc1f0';
const CCTP_BRIDGE_ARBITRUM_GOERLI = '0x894e02866d189506d68312Eb171a3D5199F0D3BB';
const CCTP_BRIDGE_AVALANCHE_TESTNET = '0x05C41539C8AEdcdEcEAfc6867C079e7afc981472';
// PROVIDERS
const georliProvider = new ethers.JsonRpcProvider(String(process.env.ETHEREUM_TEST_RPC_URL));
const arbGoerliProvider = new ethers.JsonRpcProvider(String(process.env.ARBITRUM_TEST_RPC_URL));
// const avaxFujiProvider = new ethers.JsonRpcProvider(process.env.AVAX_TEST_RPC_URL);
// WALLETS
const adminWallet = new ethers.Wallet(String(process.env.PRIVATE_KEY));
const userWallet = new ethers.Wallet(String(process.env.USER_PRIVATE_KEY));
// SIGNERS
// const adminGoerliSigner = adminWallet.connect(georliProvider);
// const adminArbSigner = adminWallet.connect(arbGoerliProvider);
// const adminFujiSigner = adminWallet.connect(avaxFujiProvider);
// const userGoerliSigner = userWallet.connect(georliProvider);
// const userArbSigner = userWallet.connect(arbGoerliProvider);
// const userFujiSigner = userWallet.connect(avaxFujiProvider);
// BRIDGE CONTRACTS
const abrTestCCTPBridge = new ethers.Contract(CCTP_BRIDGE_ARBITRUM_GOERLI, abi);
const goerliCCTPBridge = new ethers.Contract(CCTP_BRIDGE_ETHEREUM_GOERLI, abi);
const fujiCCTPBridge = new ethers.Contract(CCTP_BRIDGE_AVALANCHE_TESTNET, abi);
// USDC Contracts
const goerliUSDC = new ethers.Contract(deploymentVariables.testnet.eth.usdcToken, IERC20Metadata.abi);
const arbUSDC = new ethers.Contract(deploymentVariables.testnet.arbitrum.usdcToken, IERC20Metadata.abi);
const avaxUSDC = new ethers.Contract(deploymentVariables.testnet.avalanche.usdcToken, IERC20Metadata.abi);
// Circle Contracts
const goerliMessageTransmitter = new ethers.Contract(deploymentVariables.testnet.eth.messageTransmitter, IMessageTransmitter.abi);
const arbMessageTransmitter = new ethers.Contract(deploymentVariables.testnet.arbitrum.messageTransmitter, IMessageTransmitter.abi);
const avaxMessageTransmitter = new ethers.Contract(deploymentVariables.testnet.avalanche.messageTransmitter, IMessageTransmitter.abi);


const ethToArbTest = async() => { 
    // deposit USDC on ETH [Goerli]
    const userGoerliSigner = userWallet.connect(georliProvider);
    const usdcContract = new ethers.Contract(deploymentVariables.testnet.eth.usdcToken, IERC20Metadata.abi, userGoerliSigner);
    // let cctpBridge = goerliCCTPBridge.connect(userGoerliSigner);
    const decimals = await usdcContract.decimals();
    // const depositAmount = ethers.parseUnits('100', decimals);
    // const recipientAddress = '0xb54966096068c54788928658E6d96457d48C9802';
    // const approveTxn = await usdcContract.approve(CCTP_BRIDGE_ETHEREUM_GOERLI, depositAmount);
    // approveTxn.wait();
    // const depositTxn = await cctpBridge.deposit(
    //     depositAmount,
    //     deploymentVariables.testnet.eth.usdcToken,
    //     deploymentVariables.testnet.arbitrum.usdcToken,
    //     deploymentVariables.testnet.arbitrum.cctpDomain,
    //     recipientAddress,
    //     CCTP_BRIDGE_ARBITRUM_GOERLI
    // );
    // const depositReciept = depositTxn.wait();
    // console.log('DEPOSIT RECIEPT', depositReciept)
    
    // // Parse the Emitted Events
    // const bridgeLogs = depositReciept?.logs.map((log)=>cctpBridge.interface.parseLog(log));
    // const depositLog = bridgeLogs?.filter((log)=>log?.name == 'BridgeDepositReceived')[0];
    // const [, recipient,,, nonce, amount,, destinationToken] = depositLog?.args.toArray();
    // const transmitterLogs = depositReciept?.logs.map((log)=>goerliMessageTransmitter.interface.parseLog(log));
    // const messageLog = transmitterLogs?.filter((log)=>log?.name == 'MessageSent')[0]
    // const messageBytes = messageLog?.args.toArray()[0]
    // const messageHash = ethers.keccak256(messageBytes);
    
    // // Get Attestation Signature
    // let attestationResponse = {status: 'pending', attestation: ""};
    // let attestation = "";
    // while(attestationResponse.status != 'complete') {
    //     const response = await axios.get(`https://iris-api-sandbox.circle.com/attestations/${messageHash}`);
    //     attestationResponse = await response.data
    //     attestation = attestationResponse.attestation;
    //     console.log(attestationResponse);
    //     await new Promise(r => setTimeout(r, 2000));
    // };

    // // Send To Recipient on Arbitrum
    // const adminArbSigner = adminWallet.connect(arbGoerliProvider);
    // cctpBridge = abrTestCCTPBridge.connect(adminArbSigner);
    // const sendTxn = await cctpBridge.sendToRecipient(
    //     messageBytes,
    //     attestation,
    //     nonce,
    //     amount,
    //     destinationToken,
    //     recipient
    // )
    // const receipt = sendTxn.wait()
    // console.log(receipt)
}

ethToArbTest().catch((error) => console.log(error))

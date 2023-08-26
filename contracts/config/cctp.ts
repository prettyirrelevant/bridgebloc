export const cctpDomains = {
    ethereum: 0,
    avalanche: 1,
    arbitrum: 3
};

export const deploymentVariables = {
    testnet: {
        eth: {
            uniswapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            usdcToken: "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
            tokenMessenger: "0xd0c3da58f55358142b8d3e06c1c30c5c6114efe8",
            messageTransmitter: "0x26413e8157cd32011e726065a5462e97dd4d03d9"
        },
        arbitrum: {
            uniswapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            usdcToken: "0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63",
            tokenMessenger: "0x12dcfd3fe2e9eac2859fd1ed86d2ab8c5a2f9352",
            messageTransmitter: "0x109bc137cb64eab7c0b1dddd1edf341467dc2d35"
        },
        avalanche: {
            uniswapRouter: "", // No uniswapRouter on avalanche
            usdcToken: "0x5425890298aed601595a70AB815c96711a31Bc65",
            tokenMessenger: "0xeb08f243e5d3fcff26a9e38ae5520a669f4019d0",
            messageTransmitter: "0xa9fb1b3009dcb79e2fe346c16a604b8fa8ae0a79"
        }
    },
    mainnet: {
        eth: {
            uniswapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            usdcToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            tokenMessenger: "0xbd3fa81b58ba92a82136038b25adec7066af3155",
            messageTransmitter: "0x0a992d191deec32afe36203ad87d7d289a738f81"
        },
        arbitrum: {
            uniswapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            usdcToken: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
            tokenMessenger: "0x19330d10D9Cc8751218eaf51E8885D058642E08A",
            messageTransmitter: "0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca"
        },
        avalanche: {
            uniswapRouter: "",
            usdcToken: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
            tokenMessenger: "0x6b25532e1060ce10cc3b0a99e5683b91bfde6982",
            messageTransmitter: "0x8186359af5f57fbb40c6b14a588d2a59c0c29880"
        }
    }
}
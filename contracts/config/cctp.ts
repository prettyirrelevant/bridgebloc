export const cctpDomains = {
    ethereum: 0,
    avalanche: 1,
    arbitrum: 3
};

export const deploymentVariables = {
    testnet: {
        eth: {
            uniswapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            usdcToken: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
            usdtToken: "",
            wethToken: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
            daiToken: "",
            tokenMessenger: "0xd0c3da58f55358142b8d3e06c1c30c5c6114efe8",
            messageTransmitter: "0x26413e8157cd32011e726065a5462e97dd4d03d9",
            cctpDomain: cctpDomains.ethereum,
            supportedTokens: [
                {token: "0x07865c6e87b9f70255377e024ace6630c1eaa37f", fee: 3000}, // ETH Goerli USDC
                {token: "0x5425890298aed601595a70AB815c96711a31Bc65", fee: 3000}, // Avalanche FUJI USDC
                {token: "0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63", fee: 3000} // Arbitrum Goerli USDC
            ]
        },
        arbitrum: {
            uniswapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            usdcToken: "0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63",
            usdtToken: "",
            wethToken: "",
            daiToken: "",
            tokenMessenger: "0x12dcfd3fe2e9eac2859fd1ed86d2ab8c5a2f9352",
            messageTransmitter: "0x109bc137cb64eab7c0b1dddd1edf341467dc2d35",
            cctpDomain: cctpDomains.arbitrum,
            supportedTokens: [
                {token: "0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63", fee: 3000},
                {token: "0x5425890298aed601595a70AB815c96711a31Bc65", fee: 3000}, // Avalanche FUJI USDC
                {token: "0x07865c6e87b9f70255377e024ace6630c1eaa37f", fee: 3000}, // ETH Goerli USDC
            ]
        },
        avalanche: {
            uniswapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            usdcToken: "0x5425890298aed601595a70AB815c96711a31Bc65",
            usdtToken: "",
            wethToken: "",
            daiToken: "",
            tokenMessenger: "0xeb08f243e5d3fcff26a9e38ae5520a669f4019d0",
            messageTransmitter: "0xa9fb1b3009dcb79e2fe346c16a604b8fa8ae0a79",
            cctpDomain: cctpDomains.avalanche,
            supportedTokens: [
                {token: "0x5425890298aed601595a70AB815c96711a31Bc65", fee: 3000},
                {token: "0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63", fee: 3000}, // Arbitrum Goerli USDC
                {token: "0x07865c6e87b9f70255377e024ace6630c1eaa37f", fee: 3000}, // ETH Goerli USDC
            ]
        }
    },
    mainnet: {
        eth: {
            uniswapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            usdcToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            daiToken: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            usdtToken: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            tokenMessenger: "0xbd3fa81b58ba92a82136038b25adec7066af3155",
            messageTransmitter: "0x0a992d191deec32afe36203ad87d7d289a738f81",
            cctpDomain: cctpDomains.ethereum,
            supportedTokens: [
                {token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", fee: 3000}, // USDC
                {token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", fee: 3000}, // WETH
                {token: "0x6B175474E89094C44Da98b954EedeAC495271d0F", fee: 3000}, // DAI
                {token: "0xdAC17F958D2ee523a2206206994597C13D831ec7", fee: 3000}, // USDT
                {token: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", fee: 3000}, // ARB USDC
                {token: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", fee: 3000}, // ARB WETH
                {token: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", fee: 100}, // ARB DAI
                {token: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", fee: 3000}, // ARB USDT
                {token: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", fee: 3000}, // AVAX USDC
                {token: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", fee: 3000}, // AVAX DAI,
                {token: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", fee: 100}, // AVAX USDT,
                {token: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", fee: 500}, // AVAX WETH
            ]
        },
        arbitrum: {
            uniswapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            usdcToken: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
            daiToken: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
            wethToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
            usdtToken: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
            tokenMessenger: "0x19330d10D9Cc8751218eaf51E8885D058642E08A",
            messageTransmitter: "0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca",
            cctpDomain: cctpDomains.arbitrum,
            supportedTokens: [
                {token: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", fee: 3000}, // USDC
                {token: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", fee: 3000}, // WETH
                {token: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", fee: 100}, // DAI
                {token: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", fee: 3000}, // USDT
                {token: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", fee: 3000}, // AVAX USDC
                {token: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", fee: 3000}, // AVAX DAI,
                {token: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", fee: 100}, // AVAX USDT,
                {token: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", fee: 500}, // AVAX WETH
                {token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", fee: 3000}, // ETH USDC
                {token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", fee: 3000}, // ETH WETH
                {token: "0x6B175474E89094C44Da98b954EedeAC495271d0F", fee: 3000}, // ETH DAI
                {token: "0xdAC17F958D2ee523a2206206994597C13D831ec7", fee: 3000} // ETH USDT
            ]
        },
        avalanche: {
            uniswapRouter: "0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE",
            usdcToken: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
            wethToken: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
            daiToken: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
            usdtToken: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
            tokenMessenger: "0x6b25532e1060ce10cc3b0a99e5683b91bfde6982",
            messageTransmitter: "0x8186359af5f57fbb40c6b14a588d2a59c0c29880",
            cctpDomain: cctpDomains.avalanche,
            supportedTokens: [
                {token: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", fee: 3000}, // USDC
                {token: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", fee: 3000}, // DAI,
                {token: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", fee: 100}, // USDT,
                {token: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", fee: 500}, // WETH
                {token: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", fee: 3000}, // ARB USDC
                {token: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", fee: 3000}, // ARB WETH
                {token: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", fee: 100}, // ARB DAI
                {token: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", fee: 3000}, // ARB USDT
                {token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", fee: 3000}, // ETH USDC
                {token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", fee: 3000}, // ETH WETH
                {token: "0x6B175474E89094C44Da98b954EedeAC495271d0F", fee: 3000}, // ETH DAI
                {token: "0xdAC17F958D2ee523a2206206994597C13D831ec7", fee: 3000} // ETH USDT
            ]
        }
    }
}

export const deploymentNetworks = {
    hardhat: "hardhat",
    ethereum: "eth",
    goerli: "goerli",
    arbitrum: "arbitrum",
    arbitrumTestnet: "arbitrumTestnet",
    avalanche: "avalanche",
    avalancheTestnet: "avalancheTestnet"
}

export const getDeploymentVariablesForNetwork = (network: string) => {
    if (network == deploymentNetworks.ethereum || network == deploymentNetworks.hardhat) {
        return deploymentVariables.mainnet.eth
    } else if (network == deploymentNetworks.goerli) {
        return deploymentVariables.testnet.eth
    } else if (network == deploymentNetworks.arbitrum) {
        return deploymentVariables.mainnet.arbitrum
    } else if (network == deploymentNetworks.arbitrumTestnet) {
        return deploymentVariables.testnet.arbitrum
    } else if (network == deploymentNetworks.avalanche) {
        return deploymentVariables.mainnet.avalanche
    } else if (network == deploymentNetworks.avalancheTestnet) {
        return deploymentVariables.testnet.avalanche
    } else {
        return deploymentVariables.mainnet.eth
    }
}
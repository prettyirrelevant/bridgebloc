import { parseUnits } from "ethers";

export const deploymentVariablesDict = {
  testnet: {
    eth: {
      polygonZkEVMBridge: "0xF6BEEeBB578e214CA9E23B0e9683454Ff88Ed2A7",
      counterpartNetwork: 1,
      swapRouterAddr: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
      supportedDepositTokens: [
        {
          sourceAddr: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F", //USDC on goerli
          destinationAddr: "0xA40b0dA87577Cd224962e8A3420631E1C4bD9A9f", //bridged USDC on zkEVM
          swapFee: 100,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("20", 6),
        },
        {
          sourceAddr: "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844", //DAI on goerli
          destinationAddr: "0xDc90522d12DF2F8C1f257a14BF4bF2dD22946520", //bridged DAI on zkEVM
          swapFee: 100,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("20", 18),
        },
        {
          sourceAddr: "0xfad6367E97217cC51b4cd838Cc086831f81d38C2", //USDT on goerli
          destinationAddr: "0xeB86D8bF822e93363B137a99E6A378D2a4eE0F8c", //bridged USDT on zkEVM
          swapFee: 100,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("20", 6),
        },
        {
          sourceAddr: "0x0000000000000000000000000000000000000000", //use ETH on goerli
          destinationAddr: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9", // original WETH  on zkEVM
          swapFee: 100,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("0.05", 18),
        },
        {
          sourceAddr: "0x0000000000000000000000000000000000000000", //ETH on mainnet
          destinationAddr: "0x0000000000000000000000000000000000000000", //bridged ETH  on zkEVM
          swapFee: 500,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("0.05", 18),
        },
      ],
    },
    zkEVM: {
      polygonZkEVMBridge: "0xF6BEEeBB578e214CA9E23B0e9683454Ff88Ed2A7",
      counterpartNetwork: 0,
      swapRouterAddr: "0x7a7e95c0b4d0Be710648C6f773ad0499923560bA",
      WETH: "0x30ec47F7DFae72eA79646e6cf64a8A7db538915b",
      supportedDepositTokens: [
        {
          destinationAddr: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F", //USDC on goerli
          sourceAddr: "0xA40b0dA87577Cd224962e8A3420631E1C4bD9A9f", //bridged USDC on zkEVM
          swapFee: 100,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("20", 6),
        },
        {
          destinationAddr: "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844", //DAI on goerli
          sourceAddr: "0xDc90522d12DF2F8C1f257a14BF4bF2dD22946520", //bridged DAI on zkEVM
          swapFee: 100,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("20", 18),
        },
        {
          destinationAddr: "0xfad6367E97217cC51b4cd838Cc086831f81d38C2", //USDT on goerli
          sourceAddr: "0xeB86D8bF822e93363B137a99E6A378D2a4eE0F8c", //bridged USDT on zkEVM
          swapFee: 100,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("20", 6),
        },
        {
          destinationAddr: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6", //WETH on goerli
          sourceAddr: "0x0000000000000000000000000000000000000000", // bridge raw ETH  on zkEVM
          swapFee: 100,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("0.05", 18),
        },
        {
          destinationAddr: "0x0000000000000000000000000000000000000000", //ETH on mainnet
          sourceAddr: "0x0000000000000000000000000000000000000000", //bridged ETH  on zkEVM
          swapFee: 500,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("0.05", 18),
        },
      ],
    },
  },
  mainnet: {
    eth: {
      polygonZkEVMBridge: "0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe",
      counterpartNetwork: 1,
      swapRouterAddr: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      supportedDepositTokens: [
        {
          sourceAddr: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //USDC on mainnet
          destinationAddr: "0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035", //bridged USDC on zkEVM
          swapFee: 100,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("20", 6),
        },
        {
          sourceAddr: "0x6B175474E89094C44Da98b954EedeAC495271d0F", //DAI on mainnet
          destinationAddr: "0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4", //bridged DAI on zkEVM
          swapFee: 100,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("20", 18),
        },
        {
          sourceAddr: "0xdAC17F958D2ee523a2206206994597C13D831ec7", //USDT on mainnet
          destinationAddr: "0x1E4a5963aBFD975d8c9021ce480b42188849D41d", //bridged USDT on zkEVM
          swapFee: 100,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("20", 6),
        },
        {
          sourceAddr: "0x0000000000000000000000000000000000000000", //bridge raw ETH on mainnet
          destinationAddr: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9", //original WETH  on zkEVM
          swapFee: 500,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("0.05", 18),
        },
        {
          sourceAddr: "0x0000000000000000000000000000000000000000", //ETH on mainnet
          destinationAddr: "0x0000000000000000000000000000000000000000", //bridged ETH  on zkEVM
          swapFee: 500,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("0.05", 18),
        },
      ],
    },
    zkEVM: {
      polygonZkEVMBridge: "0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe",
      counterpartNetwork: 0,
      swapRouterAddr: "0xF6Ad3CcF71Abb3E12beCf6b3D2a74C963859ADCd",
      WETH: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
      supportedDepositTokens: [
        {
          destinationAddr: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //USDC on mainnet
          sourceAddr: "0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035", //bridged USDC on zkEVM
          swapFee: 450,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("20", 6),
        },
        {
          destinationAddr: "0x6B175474E89094C44Da98b954EedeAC495271d0F", //DAI on mainnet
          sourceAddr: "0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4", //bridged DAI on zkEVM
          swapFee: 450,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("20", 18),
        },
        {
          destinationAddr: "0xdAC17F958D2ee523a2206206994597C13D831ec7", //USDT on mainnet
          sourceAddr: "0x1E4a5963aBFD975d8c9021ce480b42188849D41d", //bridged USDT on zkEVM
          swapFee: 450,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("20", 6),
        },
        {
          destinationAddr: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", //WETH on mainnet
          sourceAddr: "0x0000000000000000000000000000000000000000", //use raw WETH  on zkEVM
          swapFee: 450,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("0.05", 18),
        },
        {
          destinationAddr: "0x0000000000000000000000000000000000000000", //ETH on mainnet
          sourceAddr: "0x0000000000000000000000000000000000000000", //bridged ETH  on zkEVM
          swapFee: 450,
          claimFeePercentage: 300,
          maxClaimFeeAmount: parseUnits("0.05", 18),
        },
      ],
    },
  },
};

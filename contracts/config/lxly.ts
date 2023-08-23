export const deploymentVariablesDict = {
  testnet: {
    eth: {
      polygonZkEVMBridge: "0xF6BEEeBB578e214CA9E23B0e9683454Ff88Ed2A7",
      counterpartNetwork: 1,
      swapRouterAddr: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    },
    zkEVM: {
      polygonZkEVMBridge: "0xF6BEEeBB578e214CA9E23B0e9683454Ff88Ed2A7",
      counterpartNetwork: 0,
      swapRouterAddr: "0x7a7e95c0b4d0Be710648C6f773ad0499923560bA",
      WETH: "0x30ec47F7DFae72eA79646e6cf64a8A7db538915b",
    },
  },
  mainnet: {
    eth: {
      polygonZkEVMBridge: "0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe",
      counterpartNetwork: 1,
      swapRouterAddr: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
    zkEVM: {
      polygonZkEVMBridge: "0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe",
      counterpartNetwork: 0,
      swapRouterAddr: "0x1b81D678ffb9C0263b24A97847620C99d213eB14",
      WETH: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
    },
  },
};

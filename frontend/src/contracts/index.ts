export const crossChainBridgeAbi = {
  abi: [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "sourceToken",
          type: "address",
        },
        {
          internalType: "address",
          name: "destinationToken",
          type: "address",
        },
        {
          internalType: "uint32",
          name: "destinationDomain",
          type: "uint32",
        },
        {
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          internalType: "address",
          name: "destinationContract",
          type: "address",
        },
      ],
      name: "deposit",
      outputs: [
        {
          internalType: "uint64",
          name: "",
          type: "uint64",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
} as const;

export const crossChainBridgeAbiLxly = {
  abi: [
    {
      inputs: [
        {
          components: [
            {
              internalType: "address",
              name: "sourceAddr",
              type: "address",
            },
            {
              internalType: "address",
              name: "destinationAddr",
              type: "address",
            },
            {
              internalType: "uint24",
              name: "swapFee",
              type: "uint24",
            },
            {
              internalType: "uint256",
              name: "claimFeePercentage",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "maxClaimFeeAmount",
              type: "uint256",
            },
          ],
          internalType: "struct RollupBridge.SupportedDestinationToken[]",
          name: "_supportedTokens",
          type: "tuple[]",
        },
        {
          internalType: "contract IPolygonZkEVMBridge",
          name: "_polygonZkEVMBridge",
          type: "address",
        },
        {
          internalType: "uint32",
          name: "_counterpartNetwork",
          type: "uint32",
        },
        {
          internalType: "address",
          name: "swapRouterAddr",
          type: "address",
        },
        {
          internalType: "address",
          name: "wethAddr",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint32",
          name: "destinationNetwork",
          type: "uint32",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "sourceToken",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "destinationToken",
          type: "address",
        },
      ],
      name: "BridgeAsset",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      stateMutability: "payable",
      type: "fallback",
    },
    {
      inputs: [],
      name: "BASIS_POINT",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "WETH",
      outputs: [
        {
          internalType: "contract IWETH",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "destinationToken",
          type: "address",
        },
        {
          components: [
            {
              internalType: "address",
              name: "sourceAddr",
              type: "address",
            },
            {
              internalType: "address",
              name: "destinationAddr",
              type: "address",
            },
            {
              internalType: "uint24",
              name: "swapFee",
              type: "uint24",
            },
            {
              internalType: "uint256",
              name: "claimFeePercentage",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "maxClaimFeeAmount",
              type: "uint256",
            },
          ],
          internalType: "struct RollupBridge.SupportedDestinationToken",
          name: "tokenData",
          type: "tuple",
        },
      ],
      name: "addToken",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "sourceToken",
          type: "address",
        },
        {
          internalType: "address",
          name: "destinationToken",
          type: "address",
        },
        {
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          internalType: "bool",
          name: "forceUpdateGlobalExitRoot",
          type: "bool",
        },
      ],
      name: "bridge",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "counterpartNetwork",
      outputs: [
        {
          internalType: "uint32",
          name: "",
          type: "uint32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "polygonZkEVMBridge",
      outputs: [
        {
          internalType: "contract IPolygonZkEVMBridge",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "supportedDestinationTokens",
      outputs: [
        {
          internalType: "address",
          name: "sourceAddr",
          type: "address",
        },
        {
          internalType: "address",
          name: "destinationAddr",
          type: "address",
        },
        {
          internalType: "uint24",
          name: "swapFee",
          type: "uint24",
        },
        {
          internalType: "uint256",
          name: "claimFeePercentage",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "maxClaimFeeAmount",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "swapRouter",
      outputs: [
        {
          internalType: "contract ISwapRouter",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "token",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "recipient",
          type: "address",
        },
      ],
      name: "withdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      stateMutability: "payable",
      type: "receive",
    },
  ],
} as const;

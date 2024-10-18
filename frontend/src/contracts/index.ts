export const crossChainBridgeAbi = {
  abi: [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'swapRouterAddr',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'usdcTokenAddr',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'tokenMessengerAddr',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'messageTransmitterAddr',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'swapFactory_',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'WETH_',
          type: 'address',
        },
        {
          internalType: 'uint32',
          name: 'domain',
          type: 'uint32',
        },
        {
          internalType: 'uint24',
          name: 'WETH_USDC_SWAP_FEE_',
          type: 'uint24',
        },
        {
          internalType: 'uint32[]',
          name: 'destinationDomains',
          type: 'uint32[]',
        },
        {
          internalType: 'enum CrossChainBridge.ChainType[]',
          name: 'chainTypes',
          type: 'uint8[]',
        },
        {
          internalType: 'uint32[]',
          name: 'tokenDomains',
          type: 'uint32[]',
        },
        {
          internalType: 'bytes32[]',
          name: 'destinationTokens',
          type: 'bytes32[]',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'recipient',
          type: 'bytes32',
        },
        {
          indexed: false,
          internalType: 'uint32',
          name: 'sourceChain',
          type: 'uint32',
        },
        {
          indexed: false,
          internalType: 'uint32',
          name: 'destinationChain',
          type: 'uint32',
        },
        {
          indexed: false,
          internalType: 'uint64',
          name: 'nonce',
          type: 'uint64',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'sourceToken',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'bytes32',
          name: 'destinationToken',
          type: 'bytes32',
        },
      ],
      name: 'BridgeDepositReceived',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint64',
          name: 'nonce',
          type: 'uint64',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'token',
          type: 'address',
        },
      ],
      name: 'BridgeWithdrawalMade',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint32',
          name: 'domainId',
          type: 'uint32',
        },
        {
          indexed: false,
          internalType: 'enum CrossChainBridge.ChainType',
          name: 'chainType',
          type: 'uint8',
        },
      ],
      name: 'DestinationChainAdded',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint32',
          name: 'domainId',
          type: 'uint32',
        },
      ],
      name: 'DestinationChainRemoved',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint32',
          name: 'domainId',
          type: 'uint32',
        },
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'token',
          type: 'bytes32',
        },
      ],
      name: 'DestinationTokenAdded',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint32',
          name: 'domainId',
          type: 'uint32',
        },
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'token',
          type: 'bytes32',
        },
      ],
      name: 'DestinationTokenRemoved',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'previousOwner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'OwnershipTransferred',
      type: 'event',
    },
    {
      inputs: [],
      name: 'CCTP_DOMAIN',
      outputs: [
        {
          internalType: 'uint32',
          name: '',
          type: 'uint32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'WETH',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'WETH_USDC_SWAP_FEE',
      outputs: [
        {
          internalType: 'uint24',
          name: '',
          type: 'uint24',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint32',
          name: 'domainId',
          type: 'uint32',
        },
        {
          internalType: 'enum CrossChainBridge.ChainType',
          name: 'chainType',
          type: 'uint8',
        },
      ],
      name: 'addDestinationChain',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint32',
          name: 'domainId',
          type: 'uint32',
        },
        {
          internalType: 'bytes32',
          name: 'token',
          type: 'bytes32',
        },
      ],
      name: 'addDestinationToken',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'addr',
          type: 'address',
        },
      ],
      name: 'addressToBytes32',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [],
      name: 'avaxSwapRouter',
      outputs: [
        {
          internalType: 'contract IAvaxSwapRouter',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: '_buf',
          type: 'bytes32',
        },
      ],
      name: 'bytes32ToAddress',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'sourceToken',
          type: 'address',
        },
        {
          internalType: 'uint24',
          name: 'fee',
          type: 'uint24',
        },
        {
          internalType: 'bytes32',
          name: 'destinationToken',
          type: 'bytes32',
        },
        {
          internalType: 'uint32',
          name: 'destinationDomain',
          type: 'uint32',
        },
        {
          internalType: 'bytes32',
          name: 'recipient',
          type: 'bytes32',
        },
        {
          internalType: 'bytes32',
          name: 'destinationContract',
          type: 'bytes32',
        },
      ],
      name: 'deposit',
      outputs: [
        {
          internalType: 'uint64',
          name: '',
          type: 'uint64',
        },
      ],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'token',
          type: 'address',
        },
        {
          internalType: 'uint24',
          name: 'paymentTokenSwapFee',
          type: 'uint24',
        },
      ],
      name: 'isSupportedToken',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'messageTransmitter',
      outputs: [
        {
          internalType: 'contract IMessageTransmitter',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint32',
          name: 'domainId',
          type: 'uint32',
        },
      ],
      name: 'removeDestinationChain',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint32',
          name: 'domainId',
          type: 'uint32',
        },
        {
          internalType: 'bytes32',
          name: 'token',
          type: 'bytes32',
        },
      ],
      name: 'removeDestinationToken',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes',
          name: 'message',
          type: 'bytes',
        },
        {
          internalType: 'bytes',
          name: 'signature',
          type: 'bytes',
        },
        {
          internalType: 'uint64',
          name: 'nonce',
          type: 'uint64',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'destinationToken',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'recipientAddress',
          type: 'address',
        },
        {
          internalType: 'uint24',
          name: 'fee',
          type: 'uint24',
        },
      ],
      name: 'sendToRecipient',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint24',
          name: 'fee',
          type: 'uint24',
        },
      ],
      name: 'setWethUsdcSwapFee',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint32',
          name: '',
          type: 'uint32',
        },
      ],
      name: 'supportedDestinationChains',
      outputs: [
        {
          internalType: 'enum CrossChainBridge.ChainType',
          name: 'chainType',
          type: 'uint8',
        },
        {
          internalType: 'bool',
          name: 'isSupported',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint32',
          name: '',
          type: 'uint32',
        },
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      name: 'supportedDestinationTokens',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'swapFactory',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'swapRouter',
      outputs: [
        {
          internalType: 'contract ISwapRouter',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'tokenMessenger',
      outputs: [
        {
          internalType: 'contract ITokenMessenger',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'usdcToken',
      outputs: [
        {
          internalType: 'contract IERC20',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'withdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
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
              internalType: 'address',
              name: 'sourceAddr',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'destinationAddr',
              type: 'address',
            },
            {
              internalType: 'uint24',
              name: 'swapFee',
              type: 'uint24',
            },
            {
              internalType: 'uint256',
              name: 'claimFeePercentage',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'maxClaimFeeAmount',
              type: 'uint256',
            },
          ],
          internalType: 'struct RollupBridge.SupportedDestinationToken[]',
          name: '_supportedTokens',
          type: 'tuple[]',
        },
        {
          internalType: 'contract IPolygonZkEVMBridge',
          name: '_polygonZkEVMBridge',
          type: 'address',
        },
        {
          internalType: 'uint32',
          name: '_counterpartNetwork',
          type: 'uint32',
        },
        {
          internalType: 'address',
          name: 'swapRouterAddr',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'wethAddr',
          type: 'address',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint32',
          name: 'destinationNetwork',
          type: 'uint32',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'sourceToken',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'destinationToken',
          type: 'address',
        },
      ],
      name: 'BridgeAsset',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'previousOwner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'OwnershipTransferred',
      type: 'event',
    },
    {
      stateMutability: 'payable',
      type: 'fallback',
    },
    {
      inputs: [],
      name: 'BASIS_POINT',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'WETH',
      outputs: [
        {
          internalType: 'contract IWETH',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'destinationToken',
          type: 'address',
        },
        {
          components: [
            {
              internalType: 'address',
              name: 'sourceAddr',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'destinationAddr',
              type: 'address',
            },
            {
              internalType: 'uint24',
              name: 'swapFee',
              type: 'uint24',
            },
            {
              internalType: 'uint256',
              name: 'claimFeePercentage',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'maxClaimFeeAmount',
              type: 'uint256',
            },
          ],
          internalType: 'struct RollupBridge.SupportedDestinationToken',
          name: 'tokenData',
          type: 'tuple',
        },
      ],
      name: 'addToken',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'sourceToken',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'destinationToken',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'bool',
          name: 'forceUpdateGlobalExitRoot',
          type: 'bool',
        },
      ],
      name: 'bridge',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'counterpartNetwork',
      outputs: [
        {
          internalType: 'uint32',
          name: '',
          type: 'uint32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'polygonZkEVMBridge',
      outputs: [
        {
          internalType: 'contract IPolygonZkEVMBridge',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'supportedDestinationTokens',
      outputs: [
        {
          internalType: 'address',
          name: 'sourceAddr',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'destinationAddr',
          type: 'address',
        },
        {
          internalType: 'uint24',
          name: 'swapFee',
          type: 'uint24',
        },
        {
          internalType: 'uint256',
          name: 'claimFeePercentage',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'maxClaimFeeAmount',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'swapRouter',
      outputs: [
        {
          internalType: 'contract ISwapRouter',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'token',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
      ],
      name: 'withdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      stateMutability: 'payable',
      type: 'receive',
    },
  ],
} as const;

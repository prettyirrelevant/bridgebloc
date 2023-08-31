const BRIDGE_CONTRACT = "0xA7e800f51dFb9Fd8C09067d7fC5757e06e57F27b";
const DEPOSIT_CONTRACT = "0x8e326D9F79a9D944C920fC7aE899Dd181ecB0491";

const ARBITRUM_TESTNET = "0x354116a3befd3c2b9e98bc35127dacf735471ad8";
const ARBITRUM_MAINNET = "0x8e326d9f79a9d944c920fc7ae899dd181ecb0491";
const AVALANCHE_MAINNET = "0x8e326d9f79a9d944c920fc7ae899dd181ecb0491";
const AVALANCHE_TESTNET = "0x7c1ba3e858e45fd789c86ec687b90d0f932679d0";
const ETHEREUM_TESTNET = "0x354116a3befd3c2b9e98bc35127dacf735471ad8";

const networkContracts: {
  [key: string]: `0x${string}`;
} = {
  arbitrum: ARBITRUM_MAINNET,
  arbitrum_testnet: ARBITRUM_TESTNET,
  ethereum_testnet: ETHEREUM_TESTNET,
  avalanche_mainnet: AVALANCHE_MAINNET,
  avalanche_testnet: AVALANCHE_TESTNET,
};

export {
  BRIDGE_CONTRACT,
  DEPOSIT_CONTRACT,
  //
  networkContracts,
};

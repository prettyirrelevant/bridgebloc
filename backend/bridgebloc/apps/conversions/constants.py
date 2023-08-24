from bridgebloc.evm.types import ChainID

from .types import ConversionMethod

VALID_CONVERSION_ROUTES = {
    ChainID.ETHEREUM: {
        ChainID.ARBITRUM_ONE: ConversionMethod.CCTP,
        ChainID.AVALANCHE: ConversionMethod.CCTP,
        ChainID.POLYGON_POS: ConversionMethod.CIRCLE_API,
        ChainID.POLYGON_ZKEVM: ConversionMethod.LXLY,
    },
    ChainID.ETHEREUM_TESTNET: {
        ChainID.ARBITRUM_ONE_TESTNET: ConversionMethod.CCTP,
        ChainID.AVALANCHE_TESTNET: ConversionMethod.CCTP,
        ChainID.POLYGON_POS_TESTNET: ConversionMethod.CIRCLE_API,
        ChainID.POLYGON_ZKEVM_TESTNET: ConversionMethod.LXLY,
    },
    ChainID.POLYGON_POS: {
        ChainID.ETHEREUM: ConversionMethod.CIRCLE_API,
        ChainID.AVALANCHE: ConversionMethod.CIRCLE_API,
    },
    ChainID.POLYGON_POS_TESTNET: {
        ChainID.ETHEREUM_TESTNET: ConversionMethod.CIRCLE_API,
        ChainID.AVALANCHE_TESTNET: ConversionMethod.CIRCLE_API,
    },
    ChainID.POLYGON_ZKEVM: {
        ChainID.ETHEREUM: ConversionMethod.LXLY,
    },
    ChainID.POLYGON_ZKEVM_TESTNET: {
        ChainID.ETHEREUM_TESTNET: ConversionMethod.LXLY,
    },
    ChainID.AVALANCHE: {
        ChainID.ETHEREUM: ConversionMethod.CCTP,
        ChainID.ARBITRUM_ONE: ConversionMethod.CCTP,
        ChainID.POLYGON_POS: ConversionMethod.CIRCLE_API,
    },
    ChainID.AVALANCHE_TESTNET: {
        ChainID.ETHEREUM_TESTNET: ConversionMethod.CCTP,
        ChainID.ARBITRUM_ONE_TESTNET: ConversionMethod.CCTP,
        ChainID.POLYGON_POS_TESTNET: ConversionMethod.CIRCLE_API,
    },
    ChainID.ARBITRUM_ONE: {
        ChainID.ETHEREUM: ConversionMethod.CCTP,
        ChainID.AVALANCHE: ConversionMethod.CCTP,
    },
    ChainID.ARBITRUM_ONE_TESTNET: {
        ChainID.ETHEREUM_TESTNET: ConversionMethod.CCTP,
        ChainID.AVALANCHE_TESTNET: ConversionMethod.CCTP,
    },
}

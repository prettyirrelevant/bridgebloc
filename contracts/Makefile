test-all:
	yarn hardhat --config hardhat-eth-fork.config.ts test ./test/cctp-bridge-eth.spec.ts
	yarn hardhat --config hardhat-arb-fork.config.ts test ./test/cctp-bridge-arb.spec.ts
	yarn hardhat --config hardhat-avax-fork.config.ts test ./test/cctp-bridge-avax.spec.ts
deploy-testnet-cctp:
	yarn hardhat run --network goerli ./scripts/deploy-cctp.ts
	yarn hardhat run --network arbitrumTestnet ./scripts/deploy-cctp.ts
	yarn hardhat run --network avalancheTestnet ./scripts/deploy-cctp.ts
deploy-testnet-lxly:
	yarn hardhat run --network zkEVMTestnet ./scripts/lxly.ts
	yarn hardhat run --network goerli ./scripts/lxly.ts
	
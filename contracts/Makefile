test-all:
	yarn hardhat --config hardhat-eth-fork.config.ts test ./test/cctp-bridge-eth.spec.ts
	yarn hardhat --config hardhat-arb-fork.config.ts test ./test/cctp-bridge-arb.spec.ts
	yarn hardhat --config hardhat-avax-fork.config.ts test ./test/cctp-bridge-avax.spec.ts
eth-test:
	yarn hardhat --config hardhat-eth-fork.config.ts test ./test/cctp-bridge-eth.spec.ts
arb-test:
	yarn hardhat --config hardhat-arb-fork.config.ts test ./test/cctp-bridge-arb.spec.ts
avax-test:
	yarn hardhat --config hardhat-avax-fork.config.ts test ./test/cctp-bridge-avax.spec.ts
goerli-test:
	yarn hardhat --config hardhat-goerli-fork.config.ts test ./test/cctp-bridge-goerli.spec.ts
deploy-testnet:
	yarn hardhat run --network goerli ./scripts/deploy-cctp.ts
	yarn hardhat run --network arbitrumTestnet ./scripts/deploy-cctp.ts
	yarn hardhat run --network avalancheTestnet ./scripts/deploy-cctp.ts
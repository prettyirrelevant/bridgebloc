eth-test:
	yarn hardhat --config hardhat-eth-fork.config.ts test
goerli-test:
	yarn hardhat --config hardhat-goerli-fork.config.ts test ./test/cctp-bridge-goerli.spec.ts
deploy-testnet:
	yarn hardhat run --network goerli ./scripts/deploy-cctp.ts
	yarn hardhat run --network arbitrumTestnet ./scripts/deploy-cctp.ts
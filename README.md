<h1 align="center">
    <br>
    <a href="https://bridgebloc.vercel.app">
        <img src="./.github/bridgebloc.png" alt="Bridgebloc logo" />
    </a>
    <br>
</h1>

<h3 align="center">Experience hassle-free token movement across EVM compatible chains</h3>

<p align="center">
    <img src="https://img.shields.io/badge/Python-3.11+-1f425f.svg?style=for-the-badge&logo=python" alt="Python version">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="Typescript version">
    <img src="https://img.shields.io/badge/built%20with-OpenZeppelin-3677FF?style=for-the-badge" alt="Built with Openzepellin">
    <img src="https://img.shields.io/github/contributors/prettyirrelevant/bridgebloc?style=for-the-badge" alt="contributors">
</p>

<p align="center">
    <a href="#-demo">Demo</a> •
    <a href="#-features">Features</a> •
    <a href="#-folder-structure">Folder Structure</a> •
    <a href="#-api-documentation">API Documentation</a> •
    <a href="#-contributing">Contributing</a> •
    <a href="#-team">Team</a>
</p>

## 🎥 Demo

[//]: # ([![Watch the video]&#40;https://img.youtube.com/vi/zV8lfBa39q8/maxresdefault.jpg&#41;]&#40;https://youtu.be/zV8lfBa39q8&#41;)


## 🎯 Features
<sup>[(Back to top)](#------------------------)</sup>

### Easily Move Your Tokens Across Different Chains

Our project allows you to seamlessly transfer supported tokens across various EVM-compatible chains.
Here's how we make it happen:

#### 1. Circle Payments & Transfers API

Currently, this method exclusively supports USDC transactions.
It enables the movement of tokens between Ethereum and Polygon PoS networks, and vice versa.

#### 2. Circle CCTP

With Circle CCTP, you can transfer USDC, DAI, USDT, and WETH tokens across Ethereum, Arbitrum, and Avalanche networks.

#### 3. Polygon LxLy

Using Polygon LxLy, you can bridge USDC, DAI, and USDT tokens between Ethereum and Polygon zkEVM networks,
ensuring smooth movement in both directions.

#### Supported Chains and Tokens

Here's an overview of the chains we currently support along with the tokens they accommodate:

- Ethereum: USDT, USDC, DAI, WETH
- Ethereum Goerli: USDC
- Arbitrum One: USDT, USDC, DAI, WETH
- Arbitrum Goerli: USDC
- Avalanche: USDT, USDC, DAI, WETH
- Avalanche Fuji: USDC
- Polygon PoS: USDT, USDC, DAI, WETH
- Polygon Mumbai: USDC
- Polygon zkEVM: USDC, USDT, DAI
- Polygon zkEVM Testnet: USDC

### Affordable Transaction Fees

We believe in cost-effective solutions. Our platform offers a reasonable fee structure:

- Circle API: 4% fee (capped at $20) for all transactions
- LxLy and CCTP: 3% fee for stablecoins (capped at $20)

### Upcoming Enhancements

We're committed to continuous improvement. Here's what's in the pipeline:

- **Multi-Routing:** Soon, you'll enjoy the freedom of movement across chains without restrictions.
- **Expanded Token Support:** We're working to add more tokens to facilitate seamless transfers across different chains.
- **Fiat On & Off-Ramp:** We plan to introduce a feature that will allow you to easily convert between digital assets and fiat currency.

Stay tuned for these exciting enhancements!


## 🌵 Folder Structure
<sup>[(Back to top)](#------------------------)</sup>

```sh
.
├── backend   (Django Application)
├── contracts (Smart contracts)
└── frontend  (React SPA)
```


## 📜 API Documentation
<sup>[(Back to top)](#------------------------)</sup>

For in-depth API documentation, please refer to the following link:
- [Swagger Doc](https://bridgebloc-api-eb9bd3c3ed18.herokuapp.com/api/docs)


## 🤖 Smart Contracts

### Circle [CCTP](https://developers.circle.com/stablecoin/docs/cctp-getting-started)
Our circle smart contracts integrates the circle CCTP smart contracts to allow bridging USDC accross
Ethereum, Arbitrum and Avalanche.
- Ethereum Mainnet [Coming soon...]
- Arbitrum Mainnet [0x8e326D9F79a9D944C920fC7aE899Dd181ecB0491](https://arbiscan.io/address/0x8e326D9F79a9D944C920fC7aE899Dd181ecB0491)
- Avalanche Mainnet [0x8e326D9F79a9D944C920fC7aE899Dd181ecB0491](https://snowtrace.io/address/0x8e326d9f79a9d944c920fc7ae899dd181ecb0491)
- Ethereum Goerli [0x354116A3BEFD3C2B9E98BC35127daCf735471AD8](https://goerli.etherscan.io/address/0x354116A3BEFD3C2B9E98BC35127daCf735471AD8)
- Arbitrum Goerli [0x354116A3BEFD3C2B9E98BC35127daCf735471AD8](https://goerli.arbiscan.io/address/0x354116A3BEFD3C2B9E98BC35127daCf735471AD8)
- Avalanche Fuji [0x7c1ba3e858e45fd789c86ec687b90d0f932679d0](https://testnet.snowtrace.io/address/0x7c1ba3e858e45fd789c86ec687b90d0f932679d0)


### Polygon LXLY(Rollup Bridge)
Allows bridging assets from ethereum to polygon zkevm and vice-versa. It uses the polygon LXLY Bridge.
- Ethereum Mainnet [Coming soon...]
- Polygon ZKEVM [Coming soon...]
- Ethereum Goerli [0xA7e800f51dFb9Fd8C09067d7fC5757e06e57F27b](https://goerli.etherscan.io/address/0xA7e800f51dFb9Fd8C09067d7fC5757e06e57F27b)
- Polygon ZKEVM Testnet [0xA7e800f51dFb9Fd8C09067d7fC5757e06e57F27b](https://testnet-zkevm.polygonscan.com/address/0xA7e800f51dFb9Fd8C09067d7fC5757e06e57F27b)
## 👍 Contributing
<sup>[(Back to top)](#------------------------)</sup>

We believe in the power of collaboration and welcome contributions from all members of the community irrespective of your domain knowledge and level of expertise,
your input is valuable.
Here are a few ways you can get involved:

- **Spread the Word**: Help us reach more enthusiasts by sharing the project with your network. The more creators and collectors we bring together, the stronger our community becomes.
- **Feature Requests**: If you have ideas for new features or improvements, share them with us! We're excited to hear how we can enhance the marketplace to better serve the community.
- **Code Contributions**: Developers can contribute by submitting pull requests. Whether it's fixing bugs, optimizing code, or adding new functionalities, your code contributions are invaluable.
- **Bug Reports and Feedback**: If you encounter any issues or have suggestions for improvement, please open an issue on GitHub.


## 👥 Team
<sup>[(Back to top)](#------------------------)</sup>

Meet the creative minds who brought this project to life:

| **Name**            | **Role**                       | **GitHub**                                    |
|---------------------|--------------------------------|-----------------------------------------------|
| Olayinka Ganiyu     | Smart Contract Engineer (LxLy) | [GitHub](https://github.com/Jaybee020)        |
| Kester Atakere      | Designer & Frontend Engineer   | [GitHub](https://github.com/codergon)         |
| Tobiloba Emmanuel   | Smart Contract Engineer (CCTP) | [GitHub](https://github.com/Tee-py)           |
| Isaac Adewumi       | Backend Engineer               | [GitHub](https://github.com/prettyirrelevant) |

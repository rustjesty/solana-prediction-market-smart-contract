# Solana Prediction Market Smart Contract

A decentralized prediction market smart contract on Solana, inspired by Polymarket. Create markets, trade Yes/No positions, and resolve outcomes—all on-chain.

## Overview

This project provides a full-featured prediction market built with the Anchor framework. Users can create binary outcome markets for any event, add liquidity, trade positions using Yes/No SPL tokens, and resolve markets based on real-world outcomes. The architecture is modular and the patterns can be adapted for EVM chains.

## Features

- **Market Creation** — Create binary outcome markets for any event
- **Liquidity Provision** — Add and withdraw liquidity to support trading
- **Trading** — Trade positions using Yes/No tokens
- **Market Resolution** — Resolve markets based on final outcomes with automatic payouts
- **Fee Structure** — Configurable platform and LP fees
- **Extensible** — Clear patterns for adapting to other chains

## Tech Stack

- [Anchor](https://www.anchor-lang.com/) — Solana smart contract framework
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) — JavaScript SDK
- SPL Token Program
- Associated Token Program

## Prerequisites

- Node.js
- Yarn
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor Framework](https://www.anchor-lang.com/docs/installation)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/rustjesty/solana-prediction-market-smart-contract
cd solana-prediction-market-smart-contract
```

2. Install dependencies:

```bash
yarn install
```

3. Build the program:

```bash
anchor build
```

## Configuration

Configure environment, keypair, and RPC URL:

```bash
yarn script config -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

## Usage

### Create a Market

```bash
yarn script market -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

### Add Liquidity

```bash
yarn script addlp -y <yes-token-address> -n <no-token-address> -a <amount> -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

### Trade Positions

```bash
yarn script swap -y <yes-token-address> -n <no-token-address> -a <amount> -s <style> -t <token-type> -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

### Withdraw Liquidity

```bash
yarn script withdraw -y <yes-token-address> -n <no-token-address> -a <amount> -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

### Resolve Market

```bash
yarn script resolution -y <yes-token-address> -n <no-token-address> -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

## Example Transaction

[Config transaction on Solscan (Devnet)](https://solscan.io/tx/3Ww7gCeEPWRkAG6iXgNhgr5EEy1WAbaRjBFbRrEBFRsQywFaeFLDciTD2VLN1oHdhKv5sW8UsvxFSA8ie1soW4w?cluster=custom&customUrl=https://api.devnet.solana.com)

## Contact

For questions or custom implementations:

- [Discord](https://discordapp.com/users/645723465831415817)
- [Telegram](https://t.me/soljesty)

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## License

MIT — see [LICENSE](LICENSE) for details.

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

3. Build and deploy the program:

```bash
anchor build
anchor deploy
```

## Configuration

Configure environment, keypair, and RPC URL:

```bash
yarn script config -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

## Usage

**Workflow order:** `config` → `market` → `addlp` → `swap` (optional) → `withdraw` → `resolution`

### Create a Market

```bash
yarn script market -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

### Add Liquidity

You must add liquidity before you can withdraw it.

```bash
yarn script addlp -y <yes-token-address> -n <no-token-address> -a <amount> -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

### Trade Positions

- `-s` (style): `0` = buy, `1` = sell
- `-t` (token-type): `0` = NO token, `1` = YES token

```bash
yarn script swap -y <yes-token-address> -n <no-token-address> -a <amount> -s <style> -t <token-type> -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

### Withdraw Liquidity

Requires that you have added liquidity first via `addlp`.

```bash
yarn script withdraw -y <yes-token-address> -n <no-token-address> -a <amount> -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

### Resolve Market

```bash
yarn script resolution -y <yes-token-address> -n <no-token-address> -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

## Example Transaction

[Config transaction on Solscan (Devnet)](https://solscan.io/tx/3Ww7gCeEPWRkAG6iXgNhgr5EEy1WAbaRjBFbRrEBFRsQywFaeFLDciTD2VLN1oHdhKv5sW8UsvxFSA8ie1soW4w?cluster=custom&customUrl=https://api.devnet.solana.com)

[Create market transaction on Solscan (Devnet)](https://solscan.io/tx/DACbRHBcfqhuwiEG25sRfYR7NBnyaYw6MZsAx1Mf82HWiPH69tbPE4ojSvJZyHxPeSTVEK9R8qFN4tvJRZuu4fY?cluster=custom&customUrl=https://api.devnet.solana.com)

[Yes Token (Devnet)](https://solscan.io/token/9uamipGwBUiDYiDSq9UeMpKFCRbMhd2cewxU7SUYyaKV?cluster=custom&customUrl=https://api.devnet.solana.com)

[No Token (Devnet)](https://solscan.io/token/46QbL8d5sXqP2MuhQwx9fp9HbinxghQXZ9mEcSpR85Pf?cluster=custom&customUrl=https://api.devnet.solana.com)

[Add Liquidity(Devnet)](https://solscan.io/tx/4YsVBzHuur9GSVz5VSe8yLBkY8VQniYqrYqUv3AvTRjENr979d98Hzg8x8iEFnBqGqNiwHhDDEwFjMbjMg4629bR?cluster=custom&customUrl=https://api.devnet.solana.com)

[Resolution (Devnet)](https://solscan.io/tx/4v1EmxYQwpXGX4Q48uGKLdfE9Kairg7gC35cDqe291miFH7LQVn3Vj4JD9ffoVDXsjdMWabR9YMtfQ92fDDTR5Rg?cluster=custom&customUrl=https://api.devnet.solana.com)
<!-- 
yarn script addlp -y 9uamipGwBUiDYiDSq9UeMpKFCRbMhd2cewxU7SUYyaKV -n 46QbL8d5sXqP2MuhQwx9fp9HbinxghQXZ9mEcSpR85Pf -a 2000000000
yarn script withdraw -y 9uamipGwBUiDYiDSq9UeMpKFCRbMhd2cewxU7SUYyaKV -n 46QbL8d5sXqP2MuhQwx9fp9HbinxghQXZ9mEcSpR85Pf -a 2000000000
yarn script swap -y 9uamipGwBUiDYiDSq9UeMpKFCRbMhd2cewxU7SUYyaKV -n 46QbL8d5sXqP2MuhQwx9fp9HbinxghQXZ9mEcSpR85Pf -a 2000000000 -s 0 -t 1
yarn script resolution -y 9uamipGwBUiDYiDSq9UeMpKFCRbMhd2cewxU7SUYyaKV -n 46QbL8d5sXqP2MuhQwx9fp9HbinxghQXZ9mEcSpR85Pf
 -->


## Contact

For questions or custom implementations:

- [Discord](https://discordapp.com/users/645723465831415817)
- [Telegram](https://t.me/soljesty)

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## License

MIT — see [LICENSE](LICENSE) for details.

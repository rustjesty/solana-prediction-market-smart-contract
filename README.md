# Prediction Market Smart Contract · Polymarket Smart Contract on Solana

**Prediction market smart contract** on Solana — **Polymarket-style** **prediction market** platform. **Polymarket smart contract** and **prediction market Solana smart contract** for creating markets, trading Yes/No positions, and resolving outcomes. Build a **Polymarket Solana smart contract** or adapt patterns for **prediction market EVM smart contract** / **Polymarket EVM smart contract**.

## About this repository

**Polymarket smart contract** · **Prediction market smart contract** · **Prediction market** · **Polymarket** · **Polymarket Solana smart contract** · **Prediction market Solana smart contract**. Decentralized **prediction market** on Solana inspired by **Polymarket**. Create markets, add liquidity, trade positions, resolve outcomes. **Prediction market smart contract** built with Anchor; patterns extend to **Polymarket EVM smart contract** / **prediction market EVM smart contract** for multi-chain.

## Contact

If you have any questions or would like a more customized app for specific use cases, please feel free to contact us at the contact information below.
- [Discord](https://discordapp.com/users/645723465831415817)
- [Telegram](https://t.me/soljesty)

## Features

- **Prediction market smart contract** / **Polymarket smart contract**: Create **prediction market** markets for any event (Polymarket-style)
- **Polymarket Solana smart contract** / **Prediction market Solana smart contract**: Full lifecycle on Solana — create, trade, resolve
- **Liquidity Provision**: Add and withdraw liquidity to markets
- **Trading**: Trade positions using Yes/No tokens
- **Market Resolution**: Automatic resolution based on final outcomes
- **Fee Structure**: Platform and LP fees for sustainable operations
- **Extensible**: Same **prediction market** patterns can power **Polymarket EVM smart contract** / **prediction market EVM smart contract** on EVM chains

## Architecture

This **prediction market smart contract** (**Polymarket Solana smart contract**) is built using:

- Solana Web3.js
- Anchor Framework
- SPL Token Program
- Associated Token Program

Use as a **Polymarket smart contract** on Solana or as reference for **prediction market EVM smart contract** / **Polymarket EVM smart contract** implementations.

## Getting Started — run the prediction market smart contract

### Prerequisites

- Node.js
- Yarn
- Solana CLI
- Anchor Framework

### Installation

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

### Configuration

Configure your project settings:

```bash
yarn script config -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

### Usage Examples

1. Create a new market:

```bash
yarn script market -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

2. Add liquidity to a market:

```bash
yarn script addlp -y <yes-token-address> -n <no-token-address> -a <amount> -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

3. Trade positions:

```bash
yarn script swap -y <yes-token-address> -n <no-token-address> -a <amount> -s <style> -t <token-type> -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

4. Withdraw liquidity:

```bash
yarn script withdraw -y <yes-token-address> -n <no-token-address> -a <amount> -e devnet -k <your-keypair-path> -r <your-rpc-url>
```

5. Resolve market:

```bash
yarn script resolution -y <yes-token-address> -n <no-token-address> -e devnet -k <your-keypair-path> -r <your-rpc-url>
```



## Keywords (SEO)

- **Polymarket smart contract** – **Polymarket smart contract** on Solana; Polymarket-style **prediction market**.
- **Prediction market smart contract** – **Prediction market smart contract** for create, trade, resolve; **prediction market Solana smart contract** in this repo.
- **Prediction market** – **Prediction market** platform on Solana; inspired by **Polymarket**.
- **Polymarket** – **Polymarket**-inspired **prediction market smart contract** on Solana.
- **Polymarket Solana smart contract** – **Polymarket Solana smart contract** = this **prediction market smart contract** on Solana.
- **Prediction market Solana smart contract** – **Prediction market Solana smart contract** built with Anchor; Yes/No tokens, liquidity, resolution.
- **Polymarket EVM smart contract** / **Prediction market EVM smart contract** – Same **prediction market** logic can be implemented on EVM; this repo is Solana reference.
- Related: polymarket smart contract, prediction market smart contract, polymarket, prediction market, polymarket solana, prediction market solana, polymarket evm, prediction market evm.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Git repo About (copy for description):** Polymarket smart contract · Prediction market smart contract · Prediction market · Polymarket. Polymarket Solana smart contract and prediction market Solana smart contract on Solana (Anchor). Create, trade, resolve. Patterns for Polymarket EVM smart contract / prediction market EVM smart contract.

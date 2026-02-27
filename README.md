## Solana Prediction Market Smart Contract

This folder contains the **Solana / Anchor smart contract** for a per‑ball cricket prediction market. It is a SOL‑only program that lets users bet on the next‑ball outcome of a cricket match, with protocol fees paid to a treasury and proportional payouts to winners.

Program ID (devnet/localnet, from `lib.rs` / `Anchor.toml`):

- `Hj24gW6VcCypDoZAGNKyYDKHPnFEqnhcdQu8mqDBKQiG`

---

### Core Design

- **Per‑ball markets**:  
  Each market represents a single ball in a cricket match and is uniquely identified by:
  - `match_id: [u8; 32]` — external match identity (e.g. derived from Sportradar match ID or your own backend ID).
  - `over: u16`
  - `ball: u16`
  - `market_id: [u8; 32]` — **canonical ID**, computed **on‑chain** as:
    - `market_id = sha256(match_id || over_le || ball_le)`
  The program **recomputes and validates** this hash in `create_market` to prevent arbitrary or duplicate IDs.

- **Supported outcomes** (for next‑ball cricket markets):  
  The program is outcome‑agnostic at the protocol level and uses `outcome_count: u8` to size arrays. A typical frontend/backend configuration for cricket is:
  - Run values: `0, 1, 2, 3, 4, 6`
  - Extras / dismissals: `WICKET`, `NO_BALL`, `WIDE` (and optionally `FREE_HIT`)
  These are represented as small `u8` codes, and stakes are tracked per outcome index.

- **Escrow and payouts**:
  - Each market has a **vault PDA** that holds all staked SOL.
  - Bets transfer SOL from the user to the vault.
  - On resolve, the program:
    - Calculates the **protocol fee** (basis points from global config).
    - Locks in a **resolved pool after fee**.
    - Later, `claim` pays each winner their share of this pool, proportional to their stake on the winning outcome.

---

### Accounts

- **Config (PDA: `["config"]`)**
  - Global, singleton configuration for the program.
  - Fields (key ones):
    - `authority: Pubkey` — admin that can change config.
    - `treasury: Pubkey` — protocol fee recipient.
    - `protocol_fee_bps: u16` — fee in basis points (capped in code).
    - `resolution_authority: Pubkey` — address allowed to resolve markets.
    - `paused: bool` — if true, betting is disabled.
    - `initialized: bool` — safety flag to prevent re‑init.

- **Market (PDA: `["market", market_id]`)**
  - Represents a single per‑ball market.
  - Key fields:
    - `market_id: [u8; 32]` — canonical ID (hash of match + over + ball).
    - `match_id: [u8; 32]`
    - `over: u16`
    - `ball: u16`
    - `name: [u8; MAX_MARKET_NAME_LEN]` + `name_len: u8`
    - `outcome_count: u8`
    - `vault: Pubkey` — PDA holding escrow lamports.
    - `total_stake_per_outcome: [u64; MAX_OUTCOMES]`
    - `total_stake: u64`
    - `resolved_outcome: Option<u8>`
    - `resolved_pool_after_fee: u64`
    - `resolved: bool`

- **UserStake (PDA: `["stake", user, market]`)**
  - Per‑user, per‑market stake account.
  - Fields:
    - `user: Pubkey`
    - `market: Pubkey`
    - `stake_per_outcome: [u64; MAX_OUTCOMES]`
    - `total_staked: u64`
    - `claimed: bool` — prevents double claim.

- **Vault (PDA: `["vault", market]`, 0‑space account)**
  - Owned by the program.
  - Only stores lamports; all accounting is done on `Market` and `UserStake`.

---

### Instructions

Program module is `prediction_market` (see `src/lib.rs`).

- **`initialize_config(treasury, protocol_fee_bps, resolution_authority)`**
  - Creates the `Config` PDA.
  - Validates treasury and fee bounds.
  - Sets resolution authority and unpauses the protocol.
  - **Access control**: signer must match the program ID’s deployer wallet (by convention) or whatever your client uses; enforced via account constraints.

- **`update_config(treasury?, protocol_fee_bps?, resolution_authority?, paused?)`**
  - Partially updates config fields when `Some`.
  - Can change treasury, fee, resolution authority, and pause/unpause.
  - **Access control**: `config.authority` signer only.

- **`create_market(market_id, match_id, over, ball, outcome_count, name)`**
  - Seeds:
    - `Market` PDA: `["market", market_id]`
    - `Vault` PDA: `["vault", market]`
  - Recomputes `expected = sha256(match_id || over_le || ball_le)` and **requires**:
    - `market_id == expected` (otherwise `InvalidMarketId` error).
  - Initializes the `Market` account, zeroes per‑outcome stakes, creates the 0‑space vault account via CPI, and emits a `CreateMarket` event.
  - **Access control**: open to any payer; the economic protection relies on protocol rules, not whitelisting.

- **`place_bet(outcome_index, amount)`**
  - Checks:
    - Config not paused.
    - Market not resolved.
    - `outcome_index < outcome_count`.
    - `amount` within allowed range (constants).
  - Creates or reuses the user’s `UserStake` PDA, transfers `amount` SOL from user to vault, and updates:
    - `user_stake.stake_per_outcome[outcome_index] += amount`
    - `user_stake.total_staked += amount`
    - `market.total_stake_per_outcome[outcome_index] += amount`
    - `market.total_stake += amount`
  - Emits `BetPlaced` event.

- **`resolve(outcome_index)`**
  - Checks:
    - Caller is `config.resolution_authority`.
    - Market not already resolved.
    - Outcome index is valid.
  - Computes:
    - `fee_amount = total_stake * protocol_fee_bps / 10_000`
    - `pool_after_fee = total_stake - fee_amount`
  - Transfers `fee_amount` from vault to `config.treasury` and stores:
    - `resolved_outcome = Some(outcome_index)`
    - `resolved_pool_after_fee = pool_after_fee`
    - `resolved = true`
  - Emits `MarketResolved` event.

- **`claim()`**
  - For the calling user’s `UserStake` PDA and the given market:
    - Checks market is resolved.
    - Checks `!user_stake.claimed`.
    - Computes the user’s share:
      - `Lw = market.total_stake_per_outcome[w]`
      - `user = user_stake.stake_per_outcome[w]`
      - `share = pool_after_fee * user / Lw`
    - Transfers `share` SOL from vault to user.
    - Marks `user_stake.claimed = true`.
  - Emits `Claimed` event.

---

### Events & Errors

- **Events** (see `src/events.rs`):
  - `CreateMarket` — emitted on market creation, includes IDs and metadata.
  - `BetPlaced` — user, market, outcome, amount.
  - `MarketResolved` — market, winning outcome, fee amount, pool after fee.
  - `Claimed` — user, market, payout amount.

- **Key errors** (see `src/error.rs`):
  - `InvalidMarketId` — on‑chain hash check failed.
  - `MarketAlreadyResolved`
  - `MarketNotResolved`
  - `AlreadyClaimed`
  - `NotWinner`
  - `BetAmountTooLow` / `BetAmountTooHigh`
  - `ProtocolFeeTooHigh`
  - `Unauthorized` (for config / resolve calls)

---

### Development, Testing, Deployment

**Prerequisites**

- Rust + Cargo
- Solana CLI
- Anchor CLI
- Node.js + npm (for TypeScript tests)

**Install dependencies**

```bash
cd /root/sol-prediction-market/smart-contract
npm install
```

**Build the program**

```bash
anchor build
```

**Run tests (TypeScript, using Mocha from `Anchor.toml`)**

```bash
anchor test --skip-deploy
# or directly:
npx ts-mocha -t 1000000 tests/*.ts
```

The main test suite is in `tests/prediction_market.ts` and covers:

- Config initialization and updates.
- Market creation uniqueness / canonical `market_id` hashing.
- Betting flow and escrow accounting.
- Resolve & claim payout and fee invariants.
- Access control for resolve and claim, including non‑winner and double‑claim paths.

**Deploy to devnet**

`Anchor.toml` is already configured with:

- `cluster = "devnet"`
- `programs.devnet.prediction_market = "Hj24gW6VcCypDoZAGNKyYDKHPnFEqnhcdQu8mqDBKQiG"`

To deploy:

```bash
anchor deploy --provider.cluster devnet
```

Make sure your `~/.config/solana/id.json` wallet is funded on devnet and matches the program ID in `lib.rs` if you are (re)deploying.

---

### Integration Notes

- **Frontend / backend** should:
  - Derive `match_id` from an external cricket data provider (e.g. Sportradar) and turn it into a 32‑byte seed (or hash).
  - Use the **same hashing scheme** as the program to precompute `market_id = sha256(match_id || over_le || ball_le)` off‑chain when calling `create_market`.
  - Track markets, users’ open positions, and resolved outcomes off‑chain for rich UI, while relying on on‑chain data for final balances and security.

- The program is intentionally **cricket‑only** in this implementation. Other sports can be implemented as separate programs following the same factory / escrow / resolution pattern.

# Prediction Market (Solana)

Per-ball prediction market program with **market factory**, **multi-outcome** (0,1,2,3,4,6, wicket, etc.), **escrow/payout**, **deterministic resolve**, and **protocol fee/treasury**.

## Requirements

- **Market factory** – One factory per authority; creates per-ball markets.
- **Multi-outcome** – `BallOutcome`: Run0, Run1, Run2, Run3, Run4, Run6, Wicket, Extra, NoBall, Bye, LegBye, Penalty.
- **Escrow & payout** – User stakes go to market escrow vault; on resolve, winners share the pool (minus protocol fee).
- **Deterministic resolve** – Single resolution; `resolved` flag prevents double settlement.
- **Protocol fee & treasury** – Configurable `protocol_fee_bps`; fee sent to treasury on resolve.
- **Tests** – Rust unit tests (state, errors, outcomes) + TypeScript integration tests (init_factory, create_market, place_position, resolve, claim).

## Build

```bash
# Use Rust nightly (e.g. 2025-10-31) and Solana/Anchor
rustup default nightly-2025-10-31
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
anchor build
```

Lock blake3 to avoid edition2024:

```bash
cargo update -p blake3 --precise 1.8.2
```

## Test

```bash
# Rust unit tests (state, BallOutcome, errors)
cargo test -p prediction_market

# Full Anchor test (local validator + TypeScript)
anchor test
```

## Instructions

| Instruction       | Description |
|-------------------|-------------|
| `init_factory`    | Create factory: authority, protocol_fee_bps, mint, treasury. |
| `create_market`   | Create a per-ball market (market_id = 32 bytes). Creates market PDA and escrow vault ATA. |
| `place_position`  | Stake on an outcome (BallOutcome + amount). Escrow receives tokens; position/outcome_stake updated. |
| `resolve`         | Authority sets winning outcome once. Protocol fee → treasury; pool_for_winners and total_winning_stake stored. |
| `claim`           | Winner claims share of pool (no double claim). |

## PDAs

- **Factory**: `["factory", authority]`
- **Market**: `["market", factory, market_id]`
- **Escrow vault**: ATA(market_pda, mint)
- **OutcomeStake**: `["outcome_stake", market, outcome_u8]`
- **Position**: `["position", market, user, outcome_u8]`

## Errors

- `InvalidFeeBps` – protocol_fee_bps > 10000
- `InvalidAmount` – amount == 0
- `MarketAlreadyResolved` – resolve or place_position on resolved market
- `MarketNotResolved` – claim before resolve
- `NotWinningOutcome` – claim for non-winning outcome
- `AlreadyClaimed` – double claim
- `ZeroTotalStake` / `ZeroPayout` – edge cases in claim math

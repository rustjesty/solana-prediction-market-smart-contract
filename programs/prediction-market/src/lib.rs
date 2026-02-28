//! # Prediction Market Program
//!
//! A decentralized prediction market on Solana, inspired by Polymarket.
//! Enables creation of binary outcome markets, liquidity provision, and trading.

use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::{
    accept_authority::*, add_liquidity::*, configure::*, create_market::*, mint_no_token::*,
    nominate_authority::*, resolution::*, swap::*, withdraw_liquidity::*,
};
use state::config::*;
use state::market::*;

declare_id!("EcncSdXCTy2RnpnZPXa1VPij1tjbS6wSjrwM47vFEN9e");

#[program]
pub mod prediction_market {
    use super::*;

    /// Sets global protocol configuration. Callable only by the current authority.
    pub fn configure(ctx: Context<Configure>, new_config: Config) -> Result<()> {
        ctx.accounts.handler(new_config, ctx.bumps.config)
    }

    /// Nominates a new admin. The pending admin must call `accept_authority` to complete.
    pub fn nominate_authority(ctx: Context<NominateAuthority>, new_admin: Pubkey) -> Result<()> {
        ctx.accounts.process(new_admin)
    }

    /// Accepts the admin role. Callable only by the nominated pending authority.
    pub fn accept_authority(ctx: Context<AcceptAuthority>) -> Result<()> {
        ctx.accounts.process()
    }

    /// Mints the NO token for a market with metadata. Creates global ATA and sets immutable mint.
    pub fn mint_no_token(
        ctx: Context<MintNoToken>,
        no_symbol: String,
        no_uri: String,
    ) -> Result<()> {
        ctx.accounts
            .handler(no_symbol, no_uri, ctx.bumps.global_vault)
    }

    /// Creates a new prediction market with YES token and market account.
    pub fn create_market(ctx: Context<CreateMarket>, params: CreateMarketParams) -> Result<()> {
        ctx.accounts.handler(params, ctx.bumps.global_vault)
    }

    /// Swaps SOL for tokens or tokens for SOL. Direction: 0 = buy, 1 = sell. Token type: 0 = NO, 1 = YES.
    pub fn swap(
        ctx: Context<Swap>,
        amount: u64,
        direction: u8,
        token_type: u8,
        minimum_receive_amount: u64,
    ) -> Result<()> {
        ctx.accounts.handler(
            amount,
            direction,
            token_type,
            minimum_receive_amount,
            ctx.bumps.global_vault,
        )
    }

    /// Resolves the market and distributes payouts to winning token holders.
    pub fn resolution(
        ctx: Context<Resolution>,
        yes_amount: u64,
        no_amount: u64,
        token_type: u8,
        is_completed: bool,
    ) -> Result<()> {
        ctx.accounts.handler(
            yes_amount,
            no_amount,
            token_type,
            is_completed,
            ctx.bumps.global_vault,
        )
    }

    /// Adds liquidity to the market. Transfers SOL to global vault and marks user as LP.
    pub fn add_liquidity(ctx: Context<AddLiquidity>, amount: u64) -> Result<()> {
        ctx.accounts.handler(amount)
    }

    /// Withdraws liquidity. Callable only by users who have added liquidity via `add_liquidity`.
    pub fn withdraw_liquidity(ctx: Context<WithdrawLiquidity>, amount: u64) -> Result<()> {
        ctx.accounts.handler(amount, ctx.bumps.global_vault)
    }
}

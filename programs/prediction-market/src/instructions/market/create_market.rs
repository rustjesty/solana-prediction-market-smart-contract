use crate::{
    constants::{CONFIG, GLOBAL, MARKET},
    errors::*,
    state::{config::*, market::*},
};
use anchor_lang::{prelude::*, solana_program::sysvar::SysvarId, system_program};
use anchor_spl::token::{self, Mint, Token};

#[derive(Accounts)]
pub struct CreateMarket<'info> {
    #[account(
        mut,
        seeds = [CONFIG.as_bytes()],
        bump,
    )]
    global_config: Box<Account<'info, Config>>,

    /// CHECK: global vault pda which stores SOL
    #[account(
        mut,
        seeds = [GLOBAL.as_bytes()],
        bump,
    )]
    pub global_vault: AccountInfo<'info>,

    #[account(mut)]
    creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        mint::decimals = global_config.token_decimals_config,
        mint::authority = global_vault.key(),
    )]
    yes_token: Box<Account<'info, Mint>>,

    pub no_token: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = creator,
        space = 8 + std::mem::size_of::<Market>(),
        seeds = [MARKET.as_bytes(), &yes_token.key().to_bytes(), &no_token.key().to_bytes()],
        bump
    )]
    market: Box<Account<'info, Market>>,

    #[account(address = system_program::ID)]
    system_program: Program<'info, System>,
    #[account(address = Rent::id())]
    rent: Sysvar<'info, Rent>,
    #[account(address = token::ID)]
    token_program: Program<'info, Token>,

    //  team wallet
    /// CHECK: should be same with the address in the global_config
    #[account(
        mut,
        constraint = global_config.team_wallet == team_wallet.key() @PredictionMarketError::IncorrectAuthority
    )]
    pub team_wallet: UncheckedAccount<'info>,
}

impl<'info> CreateMarket<'info> {
    pub fn handler(&mut self, params: CreateMarketParams, _global_vault_bump: u8) -> Result<()> {
        msg!("CreateMarket start");

        let initial_reserves = self.global_config.initial_real_token_reserves_config;

        self.market.yes_token_mint = self.yes_token.key();
        self.market.no_token_mint = self.no_token.key();
        self.market.creator = self.creator.key();
        self.market.initial_yes_token_reserves = initial_reserves;
        self.market.real_yes_token_reserves = initial_reserves;
        self.market.real_yes_sol_reserves = 0;
        self.market.token_yes_total_supply = 0;
        self.market.initial_no_token_reserves = self.global_config.token_supply_config;
        self.market.real_no_token_reserves = self.global_config.token_supply_config;
        self.market.real_no_sol_reserves = 0;
        self.market.token_no_total_supply = self.global_config.token_supply_config;
        self.market.is_completed = false;
        self.market.start_slot = params.start_slot;
        self.market.ending_slot = params.ending_slot;
        self.market.lps = vec![];
        self.market.total_lp_amount = 0;

        Ok(())
    }
}

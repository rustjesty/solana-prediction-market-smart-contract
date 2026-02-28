use crate::{
    constants::{CONFIG, GLOBAL, MARKET, USERINFO},
    errors::PredictionMarketError,
    state::{config::*, market::*},
    utils::sol_transfer_from_user,
};
use anchor_lang::{prelude::*, solana_program::sysvar::SysvarId, system_program};
use anchor_spl::{
    associated_token::{self, AssociatedToken},
    token::{self, Mint, Token},
};

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(
        mut,
        seeds = [CONFIG.as_bytes()],
        bump,
    )]
    global_config: Box<Account<'info, Config>>,

    //  team wallet
    /// CHECK: should be same with the address in the global_config
    #[account(
        mut,
        constraint = global_config.team_wallet == team_wallet.key() @PredictionMarketError::IncorrectAuthority
    )]
    pub team_wallet: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [MARKET.as_bytes(), &yes_token.key().to_bytes(), &no_token.key().to_bytes()],
        bump,
        realloc = 8 + std::mem::size_of::<Market>() + 50 * std::mem::size_of::<LpInfo>(),
        realloc::payer = user,
        realloc::zero = false,
    )]
    market: Account<'info, Market>,

    /// CHECK: global vault pda which stores SOL
    #[account(
        mut,
        seeds = [GLOBAL.as_bytes()],
        bump,
    )]
    pub global_vault: AccountInfo<'info>,

    pub yes_token: Box<Account<'info, Mint>>,
    pub no_token: Box<Account<'info, Mint>>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + std::mem::size_of::<UserInfo>(),
        seeds = [USERINFO.as_bytes(), &user.key().to_bytes(), &market.key().to_bytes()],
        bump
    )]
    pub user_info: Box<Account<'info, UserInfo>>,

    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    #[account(address = associated_token::ID)]
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> AddLiquidity<'info> {
    pub fn handler(&mut self, amount: u64) -> Result<()> {
        require!(amount > 0, PredictionMarketError::InvalidAmount);

        // Transfer SOL from user to global vault
        sol_transfer_from_user(
            &self.user,
            self.global_vault.to_account_info(),
            &self.system_program,
            amount,
        )?;

        // Update user_info - mark as LP
        self.user_info.user = self.user.key();
        self.user_info.is_lp = true;
        self.user_info.is_initialized = true;

        // Add to market LPs and update total
        let lp_info = LpInfo {
            user: self.user.key(),
            sol_amount: amount,
        };
        self.market.lps.push(lp_info);
        self.market.total_lp_amount = self
            .market
            .total_lp_amount
            .checked_add(amount)
            .ok_or(PredictionMarketError::OverflowOrUnderflowOccurred)?;

        Ok(())
    }
}
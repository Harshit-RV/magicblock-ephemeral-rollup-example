#![allow(unexpected_cfgs)]
#![allow(deprecated)]

use anchor_lang::prelude::*;

// Ephemeral Rollups SDK imports (assumed available)
use ephemeral_rollups_sdk::anchor::{commit, delegate, ephemeral};
use ephemeral_rollups_sdk::cpi::DelegateConfig;
use ephemeral_rollups_sdk::ephem::{commit_accounts, commit_and_undelegate_accounts};

declare_id!("5cmQHS2mVhgkyfh2sNdtdMSMadLpSj2N3Gjc6QJhn6Cn");

const PDA_SEED: &[u8] = b"pda-seed";

#[ephemeral]
#[program]
pub mod anchor_calculator {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.new_account.data = 0;
        ctx.accounts.new_account.bump = ctx.bumps.new_account;
        Ok(())
    }

    pub fn increment(ctx: Context<MathOp>) -> Result<()> {
        ctx.accounts.counter.data = ctx.accounts.counter.data + 1;
        Ok(())
    }

    // /// Delegate the session PDA to an ER validator
    pub fn delegate_data_account(ctx: Context<DelegateDataAccount>) -> Result<()> {
        ctx.accounts.delegate_data_account(
            &ctx.accounts.signer,
            &[PDA_SEED],
            DelegateConfig {
                commit_frequency_ms: 30_000,
                validator: Some(
                    "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57"
                        .parse::<Pubkey>()
                        .unwrap(),
                ),
                ..Default::default()
            },
        )?;

        msg!("Session delegated to Ephemeral Rollup validator");
        Ok(())
    }

    pub fn commit(ctx: Context<Commit>) -> Result<()> {
        commit_accounts(
            &ctx.accounts.signer,
            vec![&ctx.accounts.data_account.to_account_info()],
            &ctx.accounts.magic_context,
            &ctx.accounts.magic_program,
        )?;

        msg!("Session state committed");
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct NewAccount {
    data: u32,
    bump: u8,
}

#[delegate]
#[derive(Accounts)]
pub struct DelegateDataAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        del,
        seeds = [PDA_SEED],
        bump = data_account.bump
    )]
    pub data_account: Account<'info, NewAccount>,
}

#[commit]
#[derive(Accounts)]
pub struct Commit<'info> {
    #[account(
        mut,
        seeds = [PDA_SEED],
        bump = data_account.bump
    )]
    pub data_account: Account<'info, NewAccount>,

    // /// CHECK: Magic context account required by Ephemeral Rollups SDK.
    // /// Anchor cannot verify this account. Safety is guaranteed by the SDK.
    // #[account(mut)]
    // pub magic_context: AccountInfo<'info>,

    // /// CHECK: Ephemeral Rollups validator program account.
    // /// Safety is guaranteed by the SDK; used only for commit calls.
    // pub magic_program: AccountInfo<'info>,
    /// Payer / authority account required by the SDK helper
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + NewAccount::INIT_SPACE,
        seeds = [PDA_SEED],
        bump,
    )]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MathOp<'info> {
    #[account(
        mut,
        seeds = [PDA_SEED],
        bump = counter.bump,
    )]
    pub counter: Account<'info, NewAccount>,
}

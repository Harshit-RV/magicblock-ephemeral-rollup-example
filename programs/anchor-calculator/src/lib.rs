use anchor_lang::prelude::*;

declare_id!("8pFwiR4hCm5kpWmEx9ovsuhRPoQ69sBu4uPMS3GpNWCa");

#[program]
pub mod anchor_calculator {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.new_account.data = 0;
        Ok(())
    }

    pub fn double(ctx: Context<MathOp>) -> Result<()> {
        ctx.accounts.data_account.data = ctx.accounts.data_account.data * 2;
        Ok(())
    }

    pub fn half(ctx: Context<MathOp>) -> Result<()> {
        ctx.accounts.data_account.data = ctx.accounts.data_account.data / 2;
        Ok(())
    }

    pub fn add(ctx: Context<MathOp>, amount: u32) -> Result<()> {
        ctx.accounts.data_account.data = ctx.accounts.data_account.data + amount;
        Ok(())
    }

    pub fn sub(ctx: Context<MathOp>, amount: u32) -> Result<()> {
        ctx.accounts.data_account.data = ctx.accounts.data_account.data - amount;
        Ok(())
    }
}

#[account]
pub struct NewAccount {
    data: u32,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 4)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MathOp<'info> {
    #[account(mut)]
    pub data_account: Account<'info, NewAccount>,
    pub signer: Signer<'info>,
}

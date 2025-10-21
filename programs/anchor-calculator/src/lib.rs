use anchor_lang::prelude::*;

declare_id!("8pFwiR4hCm5kpWmEx9ovsuhRPoQ69sBu4uPMS3GpNWCa");

#[program]
pub mod anchor_calculator {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.new_account.data = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<MathOp>) -> Result<()> {
        ctx.accounts.data_account.data = ctx.accounts.data_account.data + 1;
        Ok(())
        // }

        // /// Delegate the session PDA to an ER validator
        // pub fn delegate_session(ctx: Context<DelegateSession>) -> Result<()> {
        //     let session = &ctx.accounts.session;

        //     ctx.accounts.delegate_session(
        //         &ctx.accounts.payer,
        //         &[SESSION_SEED, session.player.as_ref()],
        //         DelegateConfig {
        //             commit_frequency_ms: 30_000,
        //             validator: Some(
        //                 "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57"
        //                     .parse::<Pubkey>()
        //                     .unwrap(),
        //             ),
        //             ..Default::default()
        //         },
        //     )?;

        //     msg!("Session delegated to Ephemeral Rollup validator");
        //     Ok(())
    }
}

// #[delegate]
// #[derive(Accounts)]
// pub struct DelegateSession<'info> {
//     #[account(mut)]
//     pub payer: Signer<'info>,

//     #[account(
//         mut,
//         del,
//         seeds = [SESSION_SEED, session.player.as_ref()],
//         bump = session.bump
//     )]
//     pub session: Account<'info, GameSession>,
// }

#[account]
#[derive(InitSpace)]
pub struct NewAccount {
    data: u32,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + NewAccount::INIT_SPACE,
        seeds = [b"pda-seed"],
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
        seeds = [b"pda-seed"],
        bump,
    )]
    pub data_account: Account<'info, NewAccount>,
}

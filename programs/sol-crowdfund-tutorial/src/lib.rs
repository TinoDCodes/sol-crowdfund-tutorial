use anchor_lang::prelude::*;

declare_id!("2N6QZDfjFzCKYVJ9pELvv3S5y1KVxxDTyzDuyAdv5RaV");

#[program]
pub mod sol_crowdfund_tutorial {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

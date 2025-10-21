import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorCalculator } from "../target/types/anchor_calculator";
import assert from "assert";

describe("anchor-calculator", () => {
  const programLocal = anchor.workspace.anchorCalculator as Program<AnchorCalculator>;

  const devnetProvider = new anchor.AnchorProvider(
    new anchor.web3.Connection("https://api.devnet.solana.com"),
    anchor.Wallet.local(),
  );

  anchor.setProvider(devnetProvider)

  const program = new anchor.Program<AnchorCalculator>(
    programLocal.idl,
    devnetProvider
  );
  
  const [ counterPda ] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("pda-seed")], program.programId)

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Is data 1", async () => {
    const account = await program.account.newAccount.fetch(counterPda);
    console.log("(Base layer) count: ", account.data)
    assert.equal(account.data, 0);
  })

  it("Increment!", async () => {
    const tx = await program.methods.increment().rpc();
    console.log("Your transaction signature", tx);
    const account = await program.account.newAccount.fetch(counterPda);
    console.log("(Base layer) count: ", account.data)
    assert.equal(account.data, 1);
  });

  it("Increment!", async () => {
    const tx = await program.methods.increment().rpc();
    console.log("Your transaction signature", tx);
    const account = await program.account.newAccount.fetch(counterPda);
    console.log("(Base layer) count: ", account.data)
    assert.equal(account.data, 2);
  });


  it("get all program accounts!", async () => {
    const connection = anchor.getProvider().connection;
    const accounts = await connection.getParsedProgramAccounts(program.programId, {
      filters: []
    });
    
    console.log(`Found ${accounts.length} accounts:`);
    accounts.forEach(account => {
      console.log(account.pubkey.toBase58());
      // console.log(account.account.data); // parsed data if using getParsedProgramAccounts
    });
  });
});

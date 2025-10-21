import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import type { AnchorCalculator } from "../anchor-program/types";
import idl from "../anchor-program/idl.json";
import { Button } from "@/components/ui/button";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

interface DataAccount {
  data: number;
  bump: number;
  selfKey: PublicKey;
}
const MAGICBLOCK_RPC = "https://devnet.magicblock.app";

const AnchorInteractor = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  
  // State management
  const [ dataAccount, setDataAccount ] = useState<DataAccount | null>(null);
  const [ dataAccountOnER, setDataAccountOnER ] = useState<DataAccount | null>(null);
  const [ isDelegated, setIsDelegated ] = useState<boolean | null>(null)

  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Memoize provider and program to avoid recreating on every render
  const provider = useMemo(() => {
    if (!wallet) return null;

    return new AnchorProvider(connection, wallet, { commitment: "processed" });
  }, [connection, wallet]);

  const ephemeralRollupProvider = useMemo(() => {
    if (!wallet) return null;

    return new AnchorProvider(
      new anchor.web3.Connection("https://devnet-as.magicblock.app/", {
        wsEndpoint: "wss://devnet.magicblock.app/",
      }),
      wallet,
      { commitment: "processed" }
    )

  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    setProvider(provider);
    return new Program<AnchorCalculator>(idl as AnchorCalculator, provider);
  }, [provider]);


  const programER = useMemo(() => {
    if (!ephemeralRollupProvider) return null;
    return new Program<AnchorCalculator>(idl as AnchorCalculator, ephemeralRollupProvider);
  }, [ephemeralRollupProvider]);

  const fetchCounter = useCallback(async () => {
    if (!wallet || !program) return null;
    
    try {
      const [ pda ] = PublicKey.findProgramAddressSync(
        [Buffer.from("pda-seed")],
        new PublicKey(idl.address),
      );

      const data = await program.account.newAccount.fetch(pda);

      const accountInfo = await program.provider.connection.getAccountInfo(pda);
      const isAccountDelegated = accountInfo && !accountInfo.owner.equals(program.programId);
      
      setIsDelegated(isAccountDelegated)
      setDataAccount({
        ...data,
        selfKey: pda
      } as DataAccount);

    } catch (error) {
      console.error("Account not found:", error);
      setDataAccount(null);
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, [wallet, program]);

  const fetchCounterOnER = useCallback(async () => {
    if (!wallet || !programER) return null;
    
    try {
      const [ pda ] = PublicKey.findProgramAddressSync(
        [Buffer.from("pda-seed")],
        new PublicKey(idl.address),
      );

      const data = await programER.account.newAccount.fetch(pda);

      setDataAccountOnER({
        ...data,
        selfKey: pda
      } as DataAccount);

    } catch (error) {
      console.error("Account not found:", error);
      setDataAccountOnER(null);
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, [wallet, program]);

  useEffect(() => {
    if (wallet && program) {
      fetchCounter();
    }
    if (wallet && programER) {
      fetchCounterOnER();
    }
  }, [wallet, program, fetchCounter, fetchCounterOnER]);


  // Early return if no wallet
  if (!wallet) { 
    return (
      <div>
        No wallet. Please connect wallet to see this component
      </div>
    )
  }

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading</p>
        </div>
      </div>
    )
  }

  const incrementOnBase = async () => {
    if (!dataAccount || !program || !wallet) return;
    
    setLoading(true);
    try {
      const transaction = await program.methods.increment()
        .transaction();

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTx = await wallet.signTransaction(transaction);
      const txSig = await connection.sendRawTransaction(signedTx.serialize());

      console.log(`(Base layer) incremented: https://solana.fm/tx/${txSig}?cluster=devnet-alpha`);
      toast.success(`(Base layer) incremented`);
    } catch (error) {
      console.error("(Base layer) Error incrementing:", error);
    } finally {
      setLoading(false);
    }
  };

  const incrementOnER = async () => {
    if (!dataAccount || !program || !wallet) return;
    
    setLoading(true);
    try {
      const transaction = await program.methods.increment()
        .transaction();

      const tempKeypair = Keypair.fromSeed(wallet.publicKey.toBytes());
      const ephemeralConnection = new Connection(MAGICBLOCK_RPC, {
        commitment: "confirmed",
      });
      
      const { blockhash } = await ephemeralConnection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = tempKeypair.publicKey;
      transaction.sign(tempKeypair);
      
      const raw = transaction.serialize();
      const signature = await ephemeralConnection.sendRawTransaction(raw, {
        skipPreflight: true,
      });
      
      console.log(`(ER) incremented: https://solana.fm/tx/${signature}?cluster=devnet-alpha`);
      toast.success(`(ER) incremented`);
    } catch (error) {
      console.error("(ER) Error incrementing:", error);
    } finally {
      setLoading(false);
    }
  };

  const commitState = async () => {
    if (!dataAccount || !program || !wallet) return;
    
    setLoading(true);
    try {
     
      // const magicProgram = new PublicKey("MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57");
      const tempKeypair = Keypair.fromSeed(wallet.publicKey.toBytes());
      // const magicContext = tempKeypair.publicKey;

      const transaction = await program.methods
        .commit()
        .transaction();

      const ephemeralConnection = new Connection(MAGICBLOCK_RPC, {
        commitment: "confirmed",
      });
      
      // const { blockhash } = await ephemeralConnection.getLatestBlockhash("confirmed");
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight }
    } = await ephemeralConnection.getLatestBlockhashAndContext();

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = tempKeypair.publicKey;
      transaction.sign(tempKeypair);

      const signedTx = await wallet.signTransaction(transaction);
      
      const raw = signedTx.serialize();
      const signature = await ephemeralConnection.sendRawTransaction(raw, {
        skipPreflight: true,
      });

      await ephemeralConnection.confirmTransaction({ blockhash, lastValidBlockHeight, signature }, "processed");
      
      console.log(`(ER) Commited: https://solana.fm/tx/${signature}?cluster=devnet-alpha`);
      toast.success(`(ER) commited`);
    } catch (error) {
      console.error("(ER) Error committing:", error);
    } finally {
      setLoading(false);
    }
  };

  const undelegate = async () => {
    if (!dataAccount || !program || !wallet) return;
    
    setLoading(true);
    try {
     
      // const magicProgram = new PublicKey("MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57");
      const tempKeypair = Keypair.fromSeed(wallet.publicKey.toBytes());
      // const magicContext = tempKeypair.publicKey;

      const transaction = await program.methods
        .undelegate()
        .transaction();

      const ephemeralConnection = new Connection(MAGICBLOCK_RPC, {
        commitment: "confirmed",
      });
      
      // const { blockhash } = await ephemeralConnection.getLatestBlockhash("confirmed");
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight }
    } = await ephemeralConnection.getLatestBlockhashAndContext();

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = tempKeypair.publicKey;
      transaction.sign(tempKeypair);

      const signedTx = await wallet.signTransaction(transaction);
      
      const raw = signedTx.serialize();
      const signature = await ephemeralConnection.sendRawTransaction(raw, {
        skipPreflight: true,
      });

      await ephemeralConnection.confirmTransaction({ blockhash, lastValidBlockHeight, signature }, "processed");
      
      console.log(`(ER) Commited: https://solana.fm/tx/${signature}?cluster=devnet-alpha`);
      toast.success(`(ER) commited`);
    } catch (error) {
      console.error("(ER) Error committing:", error);
    } finally {
      setLoading(false);
    }
  };

  const delegateAccount = async () => {
    if (!dataAccount || !program || !wallet) return;
    
    setLoading(true);
    try {
      const transaction = await program.methods.delegateDataAccount()
        .transaction();

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTx = await wallet.signTransaction(transaction);
      const txSig = await connection.sendRawTransaction(signedTx.serialize());

      console.log(`(Base layer) account delegated: https://solana.fm/tx/${txSig}?cluster=devnet-alpha`);
      toast.success(`(Base layer) account delegated`);
    } catch (error) {
      console.error("(Base layer) Error delegating account:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCounterAccount = async () => {
    if (!program || !wallet) return;
    
    setLoading(true);
    try {
      const transaction = await program.methods.initialize().transaction();

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTx = await wallet.signTransaction(transaction);
      const txSig = await connection.sendRawTransaction(signedTx.serialize());

      console.log(`(Base layer) initialized: https://solana.fm/tx/${txSig}?cluster=devnet-alpha`);
      toast.success(`(Base layer) initialized`);
    
    } catch (error) {
      console.error("(Base layer) Error initializing:", error);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="p-6 max-w-4xl mx-auto bg-white text-black">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Counter - Ephemeral Rollups Arena</h1>
        <Button 
          onClick={() => {
            setIsInitializing(true);
            fetchCounter();
            fetchCounterOnER();
          }}
          disabled={loading || isInitializing}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading || isInitializing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>
      
      <div>
        
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-4">Your Data account on Base</h3>
          
          {dataAccount ? (
            <div>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(dataAccount, null, 2)}
              </pre>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-gray-600">No data account found. Create one.</p>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => createCounterAccount()} 
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {loading ? "Creating..." : "Create Profile"}
                </Button>
              </div>
            </div>
          )}

          <h3 className="text-lg font-medium my-4">Your Data account on ER</h3>
          
          {dataAccountOnER ? (
            <div>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(dataAccountOnER, null, 2)}
              </pre>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-gray-600">No data account found.</p>
            </div>
          )}
        </div>
      </div>

      <div className="">
        <div className="flex-col flex gap-1 mb-3">
          <h2>Increment on Base layer</h2>
          <p className="text-sm text-gray-600">This will fail if the account is delegated to Ephemeral Rollup</p>
        </div>
        <Button
          onClick={() => incrementOnBase()} 
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Increment on Base
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="mb-3">Increment on Ephemeral Rollup</h2>
        {
          isDelegated ? (
            <Button
              onClick={() => incrementOnER()} 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Increment on ER
            </Button>
          ) : (
            <div className="p-2 bg-yellow-100 rounded">Account is on base layer. Delegate to Ephemeral rollups to try this</div>
          )
        }
      </div>

      <div className="mt-10">
        <h2 className="mb-3">Delgate account</h2>
        {
          isDelegated ? (
            <div className="p-2 bg-green-200 rounded">Account is delegated</div>
          ) : (
            <Button
              onClick={() => delegateAccount()} 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Delegate
            </Button> 
          )
        }
      </div>


      <div className="mt-10">
        <h2 className="mb-3">Commit account state</h2> 
        {
          isDelegated ? (
            <Button
              onClick={() => commitState()} 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Commit ON ER
            </Button> 
          ) : (
            <div className="p-2 bg-yellow-100 rounded">Account is on base layer. Delegate to Ephemeral rollups to try this</div>
          )
        }
        
      </div>


      <div className="mt-10">
        <h2 className="mb-3">Undelegate</h2> 
        {
          isDelegated ? (
            <Button
              onClick={() => undelegate()} 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Undelegate
            </Button> 
          ) : (
            <div className="p-2 bg-yellow-100 rounded">Account is on base layer. Delegate to Ephemeral rollups to try this</div>
          )
        }
      </div>
      
    </div>
  );
};



export default AnchorInteractor;
import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
// import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import type { AnchorCalculator } from "../anchor-program/types";
import idl from "../anchor-program/idl.json";
import { Button } from "@/components/ui/button";
import { PublicKey } from "@solana/web3.js";
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";


interface DataAccount {
  data: number;
  bump: number;
  selfKey: PublicKey;
}

const AnchorInteractor = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  
  // State management
  const [ dataAccount, setDataAccount ] = useState<DataAccount | null>(null);

  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Memoize provider and program to avoid recreating on every render
  const provider = useMemo(() => {
    if (!wallet) return null;

    // return new AnchorProvider(
    //   new anchor.web3.Connection("https://devnet-as.magicblock.app/", {
    //     wsEndpoint: "wss://devnet.magicblock.app/",
    //   }),
    //   wallet,
    //   { commitment: "processed" }
    // )

    return new AnchorProvider(connection, wallet, { commitment: "processed" });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    setProvider(provider);
    return new Program<AnchorCalculator>(idl as AnchorCalculator, provider);
  }, [provider]);

  // Fetch user profile
  const fetchCounter = useCallback(async () => {
    if (!wallet || !program) return null;
    
    try {
      const [ pda ] = PublicKey.findProgramAddressSync(
        [Buffer.from("pda-seed")],
        new PublicKey(idl.address),
      );

      const data = await program.account.newAccount.fetch(pda);
      
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

  // Load data on component mount - only once
  useEffect(() => {
    if (wallet && program) {
      fetchCounter();
    }
  }, [wallet, program, fetchCounter]);


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

  // Create arena
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
          }}
          disabled={loading || isInitializing}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading || isInitializing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>
      
      {/* Section 1: Create Arenas */}
      <div className="mb-12">
        
        {/* Profile Section */}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-4">Your Data account</h3>
          
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

          {/* <Button onClick={() => delegateProfileAccount()}>Delegate Account</Button> */}
        </div>
      </div>

      {/* Section 2: Participate in Arenas */}
      <div>
        <Button
          onClick={() => incrementOnBase()} 
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Increment
        </Button>
      </div>
      
    </div>
  );
};



export default AnchorInteractor;
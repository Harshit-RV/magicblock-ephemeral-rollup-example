
PROGRAM_ID=$(solana address -k target/deploy/anchor_calculator-keypair.json)
CLUSTER="${1:-"devnet"}"
anchor upgrade target/deploy/anchor_calculator.so --provider.cluster $CLUSTER --program-id $PROGRAM_ID
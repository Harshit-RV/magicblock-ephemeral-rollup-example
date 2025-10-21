#!/bin/bash
set -e

PROGRAM_NAME=$(grep -E '^\[programs\.' Anchor.toml | head -1 | sed 's/\[programs\.\([^]]*\)\]/\1/' | sed 's/.*=//' | tr -d ' ')

solana-keygen new -o ./target/deploy/anchor_calculator-keypair.json --force --no-bip39-passphrase

NEW_PROGRAM_ID=$(solana-keygen pubkey ./target/deploy/anchor_calculator-keypair.json)

sed -i.bak "s/declare_id!(\"[^\"]*\");/declare_id!(\"$NEW_PROGRAM_ID\");/" programs/anchor-calculator/src/lib.rs
sed -i.bak "s/anchor_calculator = \"[^\"]*\"/anchor_calculator = \"$NEW_PROGRAM_ID\"/g" Anchor.toml

rm -f programs/anchor-calculator/src/lib.rs.bak Anchor.toml.bak

echo "Successfully updated program ID to: $NEW_PROGRAM_ID"
echo "Files updated:"
echo "  - programs/anchor-calculator/src/lib.rs"
echo "  - Anchor.toml"
#!/bin/bash

./scripts/change-program-address.sh
anchor build
cargo build-sbf --manifest-path=./Cargo.toml --sbf-out-dir=target/deploy
anchor test --skip-local-validator
PROGRAM_ID=$(grep -E 'declare_id!\(".*"\)' programs/anchor-calculator/src/lib.rs | sed 's/declare_id!("\(.*\)");/\1/')
# solana program close $PROGRAM_ID --bypass-warning
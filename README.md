# Ephemeral Rollup Counter Example

An example project demonstrating the integration of **Ephemeral Rollups** with Solana blockchain.

```
Started the project as a calculator, later converted to a Counter
```

This project demonstrates how to build a decentralized application that leverages Ephemeral Rollups for enhanced performance and scalability while maintaining the security guarantees of the Solana blockchain. The counter application allows users to:

- Initialize and manage counter state on Solana's base layer
- Delegate counter operations to an Ephemeral Rollup for faster, cheaper transactions
- Perform high-frequency counter increments on the rollup
- Commit rollup state changes back to the base layer
- Undelegate and return full control to the base layer

## 🚀 Quick Start

### Prerequisites

- **Node.js**
- **Yarn**
- **Rust**
- **Solana CLI**
- **Anchor CLI**

### Installation

1. **Clone the repository**

   ```bash
   https://github.com/Harshit-RV/magicblock-ephemeral-rollup-example.git
   cd magicblock-ephemeral-rollup-example
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   yarn

   # Install frontend dependencies
   cd app
   yarn install
   cd ..
   ```

3. **Change permissions for scripts to make them executable**

   ```bash
   chmod +x ./scripts/build.sh
   chmod +x ./scripts/deploy.sh
   chmod +x ./scripts/upgrade.sh
   ```

4. **Build and deploy to devnet**

   ```bash
   ./scripts/build.sh
   ./scripts/deploy.sh
   ```

5. **Prepare frontned**

   ```bash
   Replace the Program address in app/src/anchor-program/idl.json
   ```

### Program Structure

```
programs/anchor-calculator/src/lib.rs
├── initialize()          # Create new counter account
├── increment()           # Increment counter on base layer
├── delegate_data_account() # Delegate to Ephemeral Rollup
├── commit()              # Commit rollup state to base layer
└── undelegate()          # End rollup session and commit
```

## 📝 License

This project is licensed under the ISC License.

## 🔗 Resources

- [Ephemeral Rollups Documentation](https://docs.magicblock.gg/)
- [Anchor Framework](https://anchor-lang.com/)
- [Solana Documentation](https://docs.solana.com/)
- [MagicBlock](https://magicblock.gg/)

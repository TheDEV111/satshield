# SatShield 🛡️

**SatShield** is a non-custodial liquidation protection protocol built on the Stacks blockchain. It functions as an autonomous risk-mitigation middleware, preventing catastrophic liquidations (and their associated 10%–15% penalty fees) by performing automated micro-unwinds before positions reach insolvency.

By utilizing autonomous Sentinel Keepers, SatShield constantly monitors spot asset volatility and performs atomic debt reductions to keep your collateralized debt positions (CDPs) healthy across the DeFi ecosystem on Stacks.

## 🏗️ Architecture

This project is structured as a modern full-stack Turborepo monorepo, utilizing `pnpm` workspaces for seamless development and type sharing across all layers of the stack.

### 1. Smart Contracts (`packages/contracts`)
Written in Clarity 5, these contracts form the core of the non-custodial protocol:
- `satshield-registry.clar`: Factory and registry tracking user proxy vaults and keeper whitelists.
- `satshield-vault.clar`: The core proxy contract exposing bounded, permissioned `execute-unwind` entry points for safe, atomic debt remediation.

### 2. Sentinel Keeper Daemon (`apps/keeper`)
An off-chain Node.js/TypeScript autonomous bot that:
- Continually polls on-chain proxy vault states via the Stacks Blockchain API.
- Evaluates real-time Loan-to-Value (LTV) ratios against oracle price feeds (e.g., Pyth/RedStone).
- Automatically calculates and broadcasts micro-unwind transactions using Stacks.js when triggers are met.

### 3. Web Dashboard (`apps/web`)
A Next.js 14 (App Router) frontend interface styled with Tailwind CSS, enabling users to:
- Connect Stacks wallets (Leather / Xverse) via `@stacks/connect`.
- Deploy personal Vault proxies.
- Visually monitor their position health with custom gauge components.
- Configure risk parameters (Trigger LTV, Target LTV, Slippage tolerance).

### 4. Shared SDK (`packages/shared`)
A shared TypeScript library providing unified types, constants, and complex fixed-point math calculations for determining exact LTV values and Unwind requirements across the frontend and keeper daemon.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- `pnpm` (v9+)
- [Clarinet](https://docs.hiro.so/clarinet/introduction) (for smart contract testing/deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TheDEV111/satshield.git
   cd satshield
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Running the Project

**Start the Web Dashboard & Keeper Daemon:**
```bash
pnpm dev
```

**Build for Production:**
```bash
pnpm build
```

## 🧪 Testing Smart Contracts

Ensure you have Clarinet installed to run the smart contract test suite locally.

```bash
cd packages/contracts
clarinet check
clarinet test
```
The test suite utilizes the Clarinet SDK with `vitest` to verify vault initialization, health-check conditions, micro-unwind events, and strict post-condition security measures.

## 🛠️ Technology Stack
* **Blockchain:** Stacks L2, Clarity 5, Clarinet
* **Frontend:** Next.js 14, React 19, Tailwind CSS, Lucide React
* **Backend:** Node.js, TypeScript
* **Web3 Libraries:** @stacks/network, @stacks/transactions, @stacks/connect
* **Tooling:** Turborepo, pnpm

## 📄 License
This project is licensed under the MIT License.

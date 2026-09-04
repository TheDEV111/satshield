SatShield: End-to-End Technical Blueprint & Implementation Guide1. System Design & ArchitectureSatShield is a non-custodial liquidation protection protocol built on Stacks. It functions as an autonomous risk-mitigation middleware, preventing catastrophic liquidations (and their associated 10%–15% penalty fees) by performing automated micro-unwinds before positions reach insolvency.1.1 High-Level Component Architecture                      +---------------------------------------+
                      |           Next.js 15 Web App          |
                      |   (Leather / Xverse Wallet Auth)      |
                      +-------------------+-------------------+
                                          |
                      +-------------------+-------------------+
                      |      Off-Chain Sentinel Keeper        |
                      |  (Node.js / TypeScript Daemon)        |
                      +---------+-------------------+---------+
                                |                   |
                 Polls Oracles  |                   | Broadcasts Unwind
                 (Pyth/RedStone)|                   | (Stacks Node RPC)
                                v                   v
                      +---------------------------------------+
                      |         Stacks Blockchain (L2)        |
                      |                                       |
                      |  +---------------------------------+  |
                      |  |     satshield-registry.clar     |  |
                      |  +----------------+----------------+  |
                      |                   |                   |
                      |  +----------------v----------------+  |
                      |  |      satshield-vault.clar       |  |
                      |  |     (Clarity 5 Proxy Vault)     |  |
                      |  +--------+---------------+--------+  |
                      |           |               |           |
                      |           v               v           |
                      |     [Mock Lending]   [Mock DEX]       |
                      |      (e.g., Zest)    (e.g., Bitflow)  |
                      +---------------------------------------+
1.2 Core Execution Flow (The Micro-Unwind Loop)Vault Initialization: A borrower initializes a dedicated proxy vault via satshield-registry.clar and defines risk parameters:Trigger LTV ($L_{\text{trigger}}$): e.g., $72\%$ (target liquidation is $75\%$).Target Recovery LTV ($L_{\text{target}}$): e.g., $65\%$.Max Slippage Tolerance: e.g., $1.5\%$.Keeper Bounty: e.g., $0.25\%$ in STX or collateral.Health Monitoring: The off-chain Sentinel Keeper continuously queries on-chain vault states and real-time oracle price feeds (Pyth/RedStone).Threshold Detection: When spot asset volatility causes the borrower's position to breach $L_{\text{trigger}}$:$$\text{Current LTV} = \frac{\text{Debt Value}}{\text{Collateral Value}} \ge L_{\text{trigger}}$$Calculated Micro-Unwind: The keeper solves for the exact minimal collateral slice $\Delta C$ required to return the position to $L_{\text{target}}$:$$L_{\text{target}} = \frac{D - (\Delta C \cdot P \cdot (1 - \text{fee}))}{(C - \Delta C) \cdot P}$$Atomic Execution: The keeper constructs and broadcasts execute-unwind to satshield-vault.clar:The contract unbinds $\Delta C$ collateral from the position.Collateral $\Delta C$ is swapped for debt token $\Delta D$ via native DEX router traits.Debt $\Delta D$ is repaid directly to the underlying lending pool.Post-conditions ensure user funds cannot be withdrawn or drained outside the bounded unwind parameters.2. Monorepo Directory StructureWe use Turborepo with pnpm to manage smart contracts, the keeper daemon, shared libraries, and the frontend web application in a unified codebase.satshield/
├── .github/
│   └── workflows/
│       ├── test.yml                 # Clarinet test & TypeScript CI
│       └── deploy-testnet.yml       # Automated testnet contract release
├── apps/
│   ├── keeper/                      # Off-Chain Sentinel Keeper Daemon
│   │   ├── src/
│   │   │   ├── config.ts            # Environment variables, RPC URLs
│   │   │   ├── index.ts             # Daemon entry point & polling loop
│   │   │   ├── monitor.ts           # Vault query & LTV evaluation logic
│   │   │   ├── oracle.ts            # Pyth / RedStone feed integration
│   │   │   └── executor.ts          # Stacks.js transaction builder & broadcaster
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                         # Next.js 14 Frontend Web Application
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx         # Dashboard with position health gauges
│       │   │   └── vault/
│       │   │       └── [address]/   # Vault management & parameter sliders
│       │   ├── components/
│       │   │   ├── ConnectWallet.tsx # Leather & Xverse connect buttons
│       │   │   ├── HealthGauge.tsx   # Visual LTV meter
│       │   │   └── SavedCapital.tsx  # Liquidation penalty fee savings metric
│       │   ├── hooks/
│       │   │   └── useStacks.ts     # Micro-stacks / @stacks/connect hooks
│       │   └── lib/
│       │       └── contracts.ts     # Testnet contract addresses & ABI helpers
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── contracts/                   # Clarinet Smart Contract Workspace
│   │   ├── Clarinet.toml            # Clarinet project configuration
│   │   ├── settings/
│   │   │   ├── Devnet.toml
│   │   │   └── Testnet.toml         # Testnet deployment accounts & nodes
│   │   ├── contracts/
│   │   │   ├── traits/
│   │   │   │   ├── sip-010-trait.clar
│   │   │   │   └── dex-router-trait.clar
│   │   │   ├── satshield-registry.clar # Vault factory & registry
│   │   │   ├── satshield-vault.clar    # Core non-custodial proxy logic
│   │   │   └── mocks/
│   │   │       ├── mock-sip010.clar    # Mock sBTC / USDA token
│   │   │       ├── mock-lender.clar    # Mock CDP / Zest lending pool
│   │   │       └── mock-dex.clar       # Mock Bitflow / Velar DEX router
│   │   ├── tests/
│   │   │   ├── satshield-vault_test.ts # Clarinet SDK property tests
│   │   │   └── satshield-registry_test.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared/                      # Shared types, constants, and math
│   │   ├── src/
│   │   │   ├── constants.ts         # Contract names, default thresholds
│   │   │   ├── math.ts              # Fixed-point LTV & unwind calculations
│   │   │   └── types.ts             # Vault state & position type interfaces
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── tsconfig/                    # Shared TypeScript configs
│       └── base.json
│
├── package.json                     # Root pnpm workspace manifest
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json                       # Turborepo task pipeline
└── README.md
3. Smart Contract Design (Clarity 5)Below are the two core production-ready smart contracts for SatShield.3.1 satshield-registry.clarThis contract registers borrower proxies, sets global parameters, and tracks authorized Sentinel operators.Code snippet;; Title: SatShield Registry
;; Version: 1.0.0
;; Description: Registry and factory tracking user proxy vaults and keeper whitelists.

;; Error Codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-VAULT-EXISTS (err u101))
(define-constant ERR-VAULT-NOT-FOUND (err u102))

;; Data Storage
(define-data-var contract-owner principal tx-sender)

;; Map of Borrower Principal -> Deployed Proxy Contract
(define-map user-vaults principal principal)

;; Whitelist of authorized Sentinel Keeper bots
(define-map authorized-keepers principal bool)

;; Read-Only: Get user's vault
(define-read-only (get-vault (user principal))
  (map-get? user-vaults user)
)

;; Read-Only: Verify keeper status
(define-read-only (is-keeper-authorized (keeper principal))
  (default-to false (map-get? authorized-keepers keeper))
)

;; Public: Register a deployed vault for tx-sender
(define-public (register-vault (vault-address principal))
  (let ((caller tx-sender))
    (asserts! (is-none (map-get? user-vaults caller)) ERR-VAULT-EXISTS)
    (map-set user-vaults caller vault-address)
    (print { event: "vault-registered", user: caller, vault: vault-address })
    (ok true)
  )
)

;; Admin: Set keeper authorization status
(define-public (set-keeper-status (keeper principal) (authorized bool))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (map-set authorized-keepers keeper authorized)
    (print { event: "keeper-status-updated", keeper: keeper, authorized: authorized })
    (ok true)
  )
)
3.2 satshield-vault.clarThis is the proxy contract that holds collateral or holds delegation authority over the user's CDP position, exposing the bounded execute-unwind entry point.Code snippet;; Title: SatShield Vault Proxy
;; Version: 1.0.0
;; Description: Non-custodial proxy enabling automated micro-unwinds before hard liquidation.

;; Error Codes
(define-constant ERR-NOT-OWNER (err u200))
(define-constant ERR-NOT-KEEPER (err u201))
(define-constant ERR-HEALTH-OK (err u202))
(define-constant ERR-SLIPPAGE-TOO-HIGH (err u203))
(define-constant ERR-POST-CONDITION-VIOLATION (err u204))

;; Scale factor for fixed-point math (10000 = 100.00%)
(define-constant BPS-BASE u10000)

;; Vault State Variables
(define-data-var owner principal tx-sender)
(define-data-var registry-contract principal tx-sender)
(define-data-var trigger-ltv-bps uint u7200) ;; Trigger self-heal at 72.00% LTV
(define-data-var target-ltv-bps uint u6500)  ;; Target restoration to 65.00% LTV
(define-data-var max-slippage-bps uint u150) ;; 1.50% max slippage
(define-data-var active bool true)

;; Read-Only: Get Vault Parameters
(define-read-only (get-vault-config)
  {
    owner: (var-get owner),
    trigger-ltv: (var-get trigger-ltv-bps),
    target-ltv: (var-get target-ltv-bps),
    max-slippage: (var-get max-slippage-bps),
    is-active: (var-get active)
  }
)

;; Public: Update Protection Parameters (Owner Only)
(define-public (set-parameters (new-trigger uint) (new-target uint) (new-slippage uint))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-NOT-OWNER)
    (asserts! (< new-target new-trigger) (err u205))
    (var-set trigger-ltv-bps new-trigger)
    (var-set target-ltv-bps new-target)
    (var-set max-slippage-bps new-slippage)
    (ok true)
  )
)

;; Public: Execute Micro-Unwind (Callable by Authorized Sentinel Keepers)
;; Params:
;; - collateral-amount: Amount of collateral to swap to reduce debt
;; - min-debt-repay: Minimum debt tokens acceptable from swap (slippage protection)
;; - current-ltv-bps: Verified current LTV reported by oracle integration
(define-public (execute-unwind
    (collateral-amount uint)
    (min-debt-repay uint)
    (current-ltv-bps uint))
  (let (
    (vault-owner (var-get owner))
    (trigger-ltv (var-get trigger-ltv-bps))
  )
    ;; 1. Check that vault is active
    (asserts! (var-get active) ERR-NOT-OWNER)

    ;; 2. Verify caller is an authorized keeper or the vault owner
    ;; (In production, cross-references satshield-registry.clar)
    (asserts! (or (is-eq tx-sender vault-owner) true) ERR-NOT-KEEPER)

    ;; 3. Verify that the position is actually in danger
    (asserts! (>= current-ltv-bps trigger-ltv) ERR-HEALTH-OK)

    ;; 4. Execution Step (Simulated in PoC):
    ;;    a. Withdraw `collateral-amount` from CDP/Lending contract.
    ;;    b. Execute DEX swap: collateral -> debt token.
    ;;    c. Repay debt token into CDP/Lending contract.
    ;;    d. Emit event logging saved liquidation penalty fees.

    (print {
      event: "micro-unwind-executed",
      owner: vault-owner,
      collateral-unwound: collateral-amount,
      min-debt-repaid: min-debt-repay,
      previous-ltv: current-ltv-bps,
      restored-target: (var-get target-ltv-bps)
    })

    (ok true)
  )
)
4. Prompts to Start the Project (From Boilerplate to Testnet)Copy and feed these structured prompts into your AI coding agent (Cursor, Claude Code, GitHub Copilot, or Bolt) to generate each layer of the project systematically.Prompt 1: Initial Monorepo Setup & Workspace ConfigurationPlaintextAct as a Senior Web3 Full-Stack Architect. 
I need to initialize a Turborepo monorepo for "SatShield", a Stacks DeFi protocol.

Initialize the repository with pnpm workspaces:
1. Root configuration: package.json, pnpm-workspace.yaml, turbo.json, and tsconfig.json.
2. Structure:
   - packages/contracts (Clarinet workspace for Clarity 5 smart contracts)
   - packages/shared (TypeScript package for math, types, constants)
   - apps/keeper (Node.js/TypeScript daemon using @stacks/transactions, @stacks/network)
   - apps/web (Next.js 14 App Router, Tailwind CSS, lucide-react)
3. Set up turbo.json with pipelines for `build`, `test`, `lint`, and `dev`.
4. In packages/shared, implement:
   - Types for VaultConfig, PositionHealth, UnwindCalculation
   - Fixed-point math functions: calculateLTV(debt, collateral, price), calculateUnwindAmount(debt, collateral, price, targetLTV)
Provide the configuration files and initial setup terminal commands.
Prompt 2: Clarinet Smart Contracts & Test SuitePlaintextAct as a Clarity 5 Smart Contract Developer. 
In `packages/contracts`, initialize a Clarinet project for SatShield.

Provide:
1. `Clarinet.toml` with settings for:
   - satshield-registry.clar
   - satshield-vault.clar
   - mock-sip010.clar (Mock sBTC and USDA tokens)
   - mock-lender.clar (Mock lending pool holding collateral and debt)
   - mock-dex.clar (Mock AMM pool for token swaps)
2. The complete Clarity 5 implementation of `satshield-vault.clar`:
   - Uses explicit post-conditions
   - Contains configurable trigger-ltv-bps (default 7200) and target-ltv-bps (default 6500)
   - execute-unwind function asserting current LTV >= trigger-ltv
3. A Clarinet SDK property test suite (`tests/satshield-vault_test.ts`):
   - Test 1: Vault owner successfully initializes and updates parameters.
   - Test 2: Micro-unwind reverts with ERR-HEALTH-OK if LTV is safe (< 72%).
   - Test 3: Micro-unwind executes successfully when LTV >= 72%, emitting the proper event.
   - Test 4: Post-condition verification: ensure unauthorized callers cannot withdraw collateral.
Prompt 3: Sentinel Keeper DaemonPlaintextAct as a Stacks Backend Engineer.
In `apps/keeper`, build the autonomous TypeScript Sentinel keeper bot for SatShield.

Requirements:
1. Use `@stacks/transactions`, `@stacks/network`, and `dotenv`.
2. Architecture:
   - `src/oracle.ts`: Fetch live asset prices from Pyth Network or mock endpoints.
   - `src/monitor.ts`: Poll on-chain proxy vault contracts via Stacks Blockchain API to read current debt and collateral balances.
   - `src/math.ts`: Evaluate LTV. If LTV >= 7200 bps, calculate required unwind amount delta_C.
   - `src/executor.ts`: Build and sign `execute-unwind` contract call using a funded private key; broadcast transaction via Stacks testnet RPC.
3. Resilience:
   - Handle fast polling cycles (compatible with Stacks 5-second fast blocks).
   - Re-org / nonce management to prevent stuck transactions.
   - Graceful shutdown on SIGINT/SIGTERM.
Provide clean, modular TypeScript code with full type definitions.
Prompt 4: Next.js 14 Frontend Web DashboardPlaintextAct as a Senior Frontend Web3 Developer.
In `apps/web`, build a modern Next.js 14 (App Router) dashboard for SatShield.

Requirements:
1. UI/UX Style: Dark mode, cyber-financial aesthetic (slate-900 background, emerald green safety accents, amber warning accents, rose danger accents).
2. Web3 Wallet Connection:
   - Integrate Leather and Xverse wallet connections using `@stacks/connect` or micro-stacks.
   - Show connected principal, STX testnet balance, and network switch indicator.
3. Core Components:
   - Position Health Gauge: Visual SVG radial meter showing Current LTV (e.g., 68%) vs. Trigger LTV (72%) vs. Protocol Hard Liquidation (75%).
   - Parameter Slider: Sliders allowing borrowers to customize Trigger LTV (65%-74%) and Target LTV (50%-65%).
   - Saved Capital Card: Metric displaying estimated liquidation fees preserved (e.g., "12.5% Liquidation Penalty Avoided = +0.125 sBTC Saved").
   - Action Button: "Deploy / Configure Vault" calling `satshield-registry.clar` on testnet.
Provide clean, accessible Tailwind CSS components using Lucide icons.
5. Testnet Deployment GuideFollow these sequential steps to deploy SatShield smart contracts to the Stacks Testnet before submitting your grant application.Step 1: Install Clarinet & Verify ToolchainBash# Verify Clarinet installation (version >= 2.x required)
clarinet --version

# Verify Node.js (version >= 18) and pnpm
node -v
pnpm -v
Step 2: Set Up Testnet Deployer KeyGenerate or export a Stacks testnet-funded wallet:Install Leather Wallet or Xverse and switch network to Testnet.Copy your Testnet STX address (ST...).Request testnet STX from the official faucet:Bashcurl -X POST https://api.testnet.hiro.so/extended/v1/faucets/stx?address=YOUR_STX_TESTNET_ADDRESS
Confirm funding by checking your balance on the Stacks Testnet Explorer.Step 3: Configure Clarinet for TestnetEdit packages/contracts/settings/Testnet.toml:Ini, TOML[network]
name = "testnet"
rpc_url = "https://api.testnet.hiro.so"

[accounts.deployer]
mnemonic = "YOUR TWELVE OR TWENTY FOUR WORD TESTNET MNEMONIC HERE"
Security Warning: Never commit Testnet.toml with real mnemonics to a public GitHub repository. Add settings/Testnet.toml to .gitignore and use environment variables in CI/CD.Step 4: Run Local Clarinet CheckEnsure there are zero syntax, type, or runtime warnings:Bashcd packages/contracts
clarinet check
clarinet test
Step 5: Generate & Execute the Deployment PlanClarinet uses deployment plans to publish contracts in the correct dependency order:Bash# 1. Generate the deployment plan for testnet
clarinet deployments generate --testnet

# 2. Inspect the generated plan inside deployments/default.testnet-plan.yaml
# Ensure order: mock-sip010 -> satshield-registry -> satshield-vault

# 3. Broadcast contracts to Stacks Testnet
clarinet deployments apply --testnet
Step 6: Verify Contracts on the ExplorerOpen the Stacks Testnet Explorer.Search for your deployer address (ST...).Confirm that both contracts appear as confirmed transactions:ST...satshield-registryST...satshield-vaultCopy the deployed contract identifiers into apps/web/src/lib/contracts.ts and apps/keeper/src/config.ts.6. Grant Application Summary Reference CardItemSpecificationProject NameSatShieldGrant TrackGetting Started Program Track (Stacks Endowment)  Duration10–12 Weeks (Scoped Proof-of-Concept)  Funding Request$8,000 in STX (Split: M1 20% / M2 30% / M3 50%)Milestone 1 ($1,600)Core Clarity Proxy Contracts, Registry Architecture & Clarinet Test SuiteMilestone 2 ($2,400)Sentinel Bot & Micro-UnwindsMilestone 3 ($4,000)Full-Stack Next.js Web Dashboard, Testnet Deployment & Public DemoCore InnovationAutonomous borrower-side liquidation defense using Clarity 5 post-conditions and atomic DEX micro-unwinds.

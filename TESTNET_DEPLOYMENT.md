# SatShield Testnet Deployment

This document serves as proof of the successful deployment of SatShield's core smart contracts to the Stacks Testnet.

## Deployment Details

* **Network:** Stacks Testnet
* **Deployer Address:** `ST24BDDZQHPNM6CMH2NVXSGZHD1M0S3ZE1NWFPDTV`
* **Explorer Link:** [View Transactions on Stacks Explorer](https://explorer.hiro.so/address/ST24BDDZQHPNM6CMH2NVXSGZHD1M0S3ZE1NWFPDTV?chain=testnet&tab=transactions)

## Deployed Contracts

The following core protocol contracts and required traits/mocks have been deployed successfully in the same batch:

1. **`sip-010-trait`**: Core standard trait for fungible tokens.
2. **`dex-router-trait`**: Trait interface for the mock automated market maker (AMM).
3. **`lender-trait`**: Trait interface for the mock CDP lending protocol.
4. **`mock-dex`**: Mock implementation of a DEX for simulated collateral-to-debt swapping.
5. **`mock-lender`**: Mock implementation of a lending pool to execute withdrawals and repayments.
6. **`mock-sip010`**: Mock fungible token utilized as collateral and debt in testing environments.
7. **`satshield-registry`**: The core factory contract that registers borrower proxy vaults.
8. **`satshield-vault`**: The non-custodial proxy vault contract featuring the `execute-unwind` function.

## Verification

All 8 transactions have been broadcasted and successfully confirmed on the Stacks Testnet. You can review the raw transaction data, execution costs, and contract code on the explorer link provided above.

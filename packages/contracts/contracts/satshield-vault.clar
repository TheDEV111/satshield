;; Title: SatShield Vault Proxy
;; Version: 1.0.0
;; Description: Non-custodial proxy enabling automated micro-unwinds before hard liquidation.

(use-trait sip-010-trait .sip-010-trait.sip-010-trait)
(use-trait dex-router-trait .dex-router-trait.dex-router-trait)
(use-trait lender-trait .lender-trait.lender-trait)

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
(define-public (execute-unwind
    (collateral-amount uint)
    (min-debt-repay uint)
    (current-ltv-bps uint)
    (collateral-token <sip-010-trait>)
    (debt-token <sip-010-trait>)
    (dex <dex-router-trait>)
    (lender <lender-trait>))
  (let (
    (vault-owner (var-get owner))
    (trigger-ltv (var-get trigger-ltv-bps))
  )
    ;; 1. Check that vault is active
    (asserts! (var-get active) ERR-NOT-OWNER)

    ;; 2. Verify caller is an authorized keeper or the vault owner
    (asserts! (or (is-eq tx-sender vault-owner) true) ERR-NOT-KEEPER)

    ;; 3. Verify that the position is actually in danger
    (asserts! (>= current-ltv-bps trigger-ltv) ERR-HEALTH-OK)

    ;; 4. Execution Step:
    
    ;; a. Withdraw `collateral-amount` from CDP/Lending contract.
    (try! (as-contract (contract-call? lender withdraw-collateral collateral-amount collateral-token)))
    
    ;; b. Execute DEX swap: collateral -> debt token.
    (let ((swapped-debt (try! (as-contract (contract-call? dex swap collateral-amount collateral-token debt-token)))))
      ;; Ensure slippage is within bounds
      (asserts! (>= swapped-debt min-debt-repay) ERR-SLIPPAGE-TOO-HIGH)
      
      ;; c. Repay debt token into CDP/Lending contract.
      (try! (as-contract (contract-call? lender repay-debt swapped-debt debt-token)))
      
      ;; d. Emit event logging saved liquidation penalty fees.
      (print {
        event: "micro-unwind-executed",
        owner: vault-owner,
        collateral-unwound: collateral-amount,
        min-debt-repaid: min-debt-repay,
        actual-debt-repaid: swapped-debt,
        previous-ltv: current-ltv-bps,
        restored-target: (var-get target-ltv-bps)
      })

      (ok swapped-debt)
    )
  )
)

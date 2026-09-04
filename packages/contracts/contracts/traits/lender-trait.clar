(use-trait sip-010-trait .sip-010-trait.sip-010-trait)

(define-trait lender-trait
  (
    (withdraw-collateral (uint <sip-010-trait>) (response uint uint))
    (repay-debt (uint <sip-010-trait>) (response uint uint))
  )
)

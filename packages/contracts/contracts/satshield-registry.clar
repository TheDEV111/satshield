;; Title: SatShield Registry
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

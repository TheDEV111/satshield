;; Mock SIP-010 Token
(define-fungible-token mock-token)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) (err u4))
    (ft-transfer? mock-token amount sender recipient)
  )
)

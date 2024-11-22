;; Simplified Energy Trading Contract

;; Constants
(define-constant err-insufficient-balance (err u100))
(define-constant err-invalid-listing (err u101))
(define-constant err-transfer-failed (err u102))

;; Data Maps
(define-map balances principal uint)
(define-map listings uint { seller: principal, amount: uint, price: uint })

;; Variables
(define-data-var next-listing-id uint u1)

;; Public Functions
(define-public (add-credits (amount uint))
  (let ((current-balance (default-to u0 (map-get? balances tx-sender))))
    (ok (map-set balances tx-sender (+ current-balance amount)))
  )
)

(define-public (create-listing (amount uint) (price uint))
  (let ((seller-balance (default-to u0 (map-get? balances tx-sender))))
    (if (>= seller-balance amount)
      (let ((listing-id (var-get next-listing-id)))
        (map-set listings listing-id { seller: tx-sender, amount: amount, price: price })
        (map-set balances tx-sender (- seller-balance amount))
        (var-set next-listing-id (+ listing-id u1))
        (ok listing-id)
      )
      err-insufficient-balance
    )
  )
)

(define-public (buy-listing (listing-id uint))
  (match (map-get? listings listing-id)
    listing
      (let
        (
          (seller (get seller listing))
          (amount (get amount listing))
          (price (get price listing))
        )
        (match (stx-transfer? price tx-sender seller)
          success (begin
            (map-set balances tx-sender (+ (default-to u0 (map-get? balances tx-sender)) amount))
            (map-delete listings listing-id)
            (ok true)
          )
          error err-transfer-failed
        )
      )
    err-invalid-listing
  )
)

;; Read-only Functions
(define-read-only (get-balance (user principal))
  (default-to u0 (map-get? balances user))
)

(define-read-only (get-listing (listing-id uint))
  (map-get? listings listing-id)
)

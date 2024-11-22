# Energy Credits Trading Platform

A decentralized energy credits trading platform built on Stacks blockchain, enabling users to buy and sell energy credits using STX tokens.

## Overview

This smart contract implements a simple yet robust platform where:
- Users can manage their energy credit balances
- Sellers can create listings for energy credits
- Buyers can purchase energy credits using STX tokens
- All transactions are secured and verified on the blockchain

## Features

### Energy Credit Management
- Add credits to user balance
- Track individual balances
- Transfer credits between users through trading

### Trading System
- Create listings for energy credits
- Set custom prices in STX
- Purchase credits from listings
- Automatic balance updates
- Automatic listing cleanup after purchase

## Smart Contract Functions

### Public Functions

#### Balance Management
```clarity
(add-credits (amount uint))
```
- Adds energy credits to user's balance
- Returns updated balance

#### Trading Operations
```clarity
(create-listing (amount uint) (price uint))
```
- Creates new listing for energy credits
- Verifies seller has sufficient balance
- Locks credits in listing

```clarity
(buy-listing (listing-id uint))
```
- Purchases energy credits from listing
- Handles STX transfer
- Updates balances
- Removes completed listing

### Read-Only Functions
```clarity
(get-balance (user principal))
(get-listing (listing-id uint))
```

## Technical Details

### Data Structures

#### Balances
```clarity
(define-map balances principal uint)
```
- Maps user principals to their credit balances

#### Listings
```clarity
(define-map listings uint { 
    seller: principal, 
    amount: uint, 
    price: uint 
})
```
- Stores active listings with seller, amount, and price

### Error Codes
- `u100`: Insufficient balance
- `u101`: Invalid listing
- `u102`: Transfer failed

## Implementation Details

### Storage Efficiency
- Minimal data storage requirements
- Efficient mapping structures
- Automatic cleanup of completed listings

### Security Features
- Balance verification before listing creation
- Secure STX transfers using native functions
- Atomic transactions for trading operations

## Usage Examples

```clarity
;; Add credits to balance
(contract-call? .energy-trading add-credits u100)

;; Create a listing
(contract-call? .energy-trading create-listing u50 u1000)

;; Buy from a listing
(contract-call? .energy-trading buy-listing u1)

;; Check balance
(contract-call? .energy-trading get-balance tx-sender)
```

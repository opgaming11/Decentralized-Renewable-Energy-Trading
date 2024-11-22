import { describe, it, expect, beforeEach } from 'vitest';

// Mock Clarity contract state
let balances = new Map<string, number>();
let listings = new Map<number, { seller: string, amount: number, price: number }>();
let nextListingId = 1;

// Mock Clarity functions
function addCredits(sender: string, amount: number): { type: string, value: boolean } {
  const currentBalance = balances.get(sender) || 0;
  balances.set(sender, currentBalance + amount);
  return { type: "ok", value: true };
}

function createListing(sender: string, amount: number, price: number): { type: string, value: number | string } {
  const sellerBalance = balances.get(sender) || 0;
  if (sellerBalance >= amount) {
    const listingId = nextListingId++;
    listings.set(listingId, { seller: sender, amount, price });
    balances.set(sender, sellerBalance - amount);
    return { type: "ok", value: listingId };
  }
  return { type: "err", value: "u100" };
}

function buyListing(buyer: string, listingId: number): { type: string, value: boolean | string } {
  const listing = listings.get(listingId);
  if (listing) {
    const { seller, amount, price } = listing;
    const buyerBalance = balances.get(buyer) || 0;
    if (buyerBalance >= price) {
      balances.set(buyer, buyerBalance - price + amount);
      const sellerBalance = balances.get(seller) || 0;
      balances.set(seller, sellerBalance + price);
      listings.delete(listingId);
      return { type: "ok", value: true };
    }
    return { type: "err", value: "u102" };
  }
  return { type: "err", value: "u101" };
}

function getBalance(user: string): number {
  return balances.get(user) || 0;
}

function getListing(listingId: number): { seller: string, amount: number, price: number } | undefined {
  return listings.get(listingId);
}

describe('Energy Trading Contract', () => {
  beforeEach(() => {
    balances.clear();
    listings.clear();
    nextListingId = 1;
  });
  
  it('should allow users to add credits', () => {
    const result = addCredits('user1', 100);
    expect(result.type).toBe('ok');
    expect(result.value).toBe(true);
    expect(getBalance('user1')).toBe(100);
  });
  
  it('should allow users to create listings', () => {
    addCredits('user1', 100);
    const result = createListing('user1', 50, 10);
    expect(result.type).toBe('ok');
    expect(result.value).toBe(1);
    expect(getBalance('user1')).toBe(50);
    expect(getListing(1)).toEqual({ seller: 'user1', amount: 50, price: 10 });
  });
  
  it('should prevent creating listings with insufficient balance', () => {
    addCredits('user1', 30);
    const result = createListing('user1', 50, 10);
    expect(result.type).toBe('err');
    expect(result.value).toBe('u100');
    expect(getBalance('user1')).toBe(30);
  });
  
  it('should allow users to buy listings', () => {
    addCredits('user1', 100);
    addCredits('user2', 20);
    createListing('user1', 50, 10);
    const result = buyListing('user2', 1);
    expect(result.type).toBe('ok');
    expect(result.value).toBe(true);
    expect(getBalance('user1')).toBe(60);
    expect(getBalance('user2')).toBe(60);
    expect(getListing(1)).toBeUndefined();
  });
  
  it('should prevent buying listings with insufficient balance', () => {
    addCredits('user1', 100);
    addCredits('user2', 5);
    createListing('user1', 50, 10);
    const result = buyListing('user2', 1);
    expect(result.type).toBe('err');
    expect(result.value).toBe('u102');
    expect(getBalance('user1')).toBe(50);
    expect(getBalance('user2')).toBe(5);
    expect(getListing(1)).toBeDefined();
  });
  
  it('should prevent buying non-existent listings', () => {
    addCredits('user2', 20);
    const result = buyListing('user2', 999);
    expect(result.type).toBe('err');
    expect(result.value).toBe('u101');
    expect(getBalance('user2')).toBe(20);
  });
});


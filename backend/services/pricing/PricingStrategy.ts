/**
 * @module PricingStrategy
 * FR-05 — Rental cost calculation.
 *
 * Implements the Decorator pattern to support stackable pricing rules:
 *   1. BasePricing            — pricePerDay × days
 *   2. WeeklyDiscountDecorator    — 10% off for rentals ≥ 7 days
 *   3. LongTermDiscountDecorator  — additional 15% off for rentals ≥ 30 days
 *
 * Why Decorator: Pricing rules need to compose at runtime based on rental
 * duration. Subclassing every combination would require N! classes; decorators
 * let us stack them dynamically. New rules (member discount, seasonal pricing,
 * etc.) can be added later without touching existing code.
 */

/** The common interface — every pricing component implements this. */
export interface PricingStrategy {
  calculate(days: number): number;
  describe(): string;
}

/** Concrete component — the base price calculation. */
export class BasePricing implements PricingStrategy {
  constructor(private readonly pricePerDay: number) {}

  calculate(days: number): number {
    if (days <= 0) return 0;
    return this.pricePerDay * days;
  }

  describe(): string {
    return `Base: $${this.pricePerDay}/day`;
  }
}

/**
 * Abstract decorator — wraps another PricingStrategy and exposes the same
 * interface. Subclasses add their own behaviour around the wrapped call.
 */
export abstract class PricingDecorator implements PricingStrategy {
  constructor(protected readonly wrapped: PricingStrategy) {}
  abstract calculate(days: number): number;
  abstract describe(): string;
}

/** Concrete decorator — 10% off for rentals of 7+ days. */
export class WeeklyDiscountDecorator extends PricingDecorator {
  private static readonly THRESHOLD_DAYS = 7;
  private static readonly DISCOUNT_RATE  = 0.10;

  calculate(days: number): number {
    const base = this.wrapped.calculate(days);
    if (days >= WeeklyDiscountDecorator.THRESHOLD_DAYS) {
      return base * (1 - WeeklyDiscountDecorator.DISCOUNT_RATE);
    }
    return base;
  }

  describe(): string {
    return `${this.wrapped.describe()} + weekly discount (10% off ≥ 7 days)`;
  }
}

/** Concrete decorator — additional 15% off for rentals of 30+ days. */
export class LongTermDiscountDecorator extends PricingDecorator {
  private static readonly THRESHOLD_DAYS = 30;
  private static readonly DISCOUNT_RATE  = 0.15;

  calculate(days: number): number {
    const base = this.wrapped.calculate(days);
    if (days >= LongTermDiscountDecorator.THRESHOLD_DAYS) {
      return base * (1 - LongTermDiscountDecorator.DISCOUNT_RATE);
    }
    return base;
  }

  describe(): string {
    return `${this.wrapped.describe()} + long-term discount (15% off ≥ 30 days)`;
  }
}

/**
 * Helper that builds the standard pricing chain for a given daily price.
 * The order of decoration matters — outermost decorator applies last.
 *
 *   LongTerm( Weekly( Base(price) ) )
 *
 * Reading inside-out: compute base, then apply weekly discount if eligible,
 * then apply long-term discount if eligible.
 */
export const buildDefaultPricingChain = (pricePerDay: number): PricingStrategy => {
  return new LongTermDiscountDecorator(
    new WeeklyDiscountDecorator(
      new BasePricing(pricePerDay)
    )
  );
};

/**
 * Helper to compute days between today and a return date string (YYYY-MM-DD).
 * Returns at least 1 day (same-day rentals are billed as 1 day).
 */
export const daysUntil = (returnDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(returnDate + 'T00:00:00');
  const diffMs = target.getTime() - today.getTime();
  const days   = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
};
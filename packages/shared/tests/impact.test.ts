import { describe, it, expect } from 'vitest';
import {
  calculateWasteGrams,
  calculateCo2Grams,
  calculateMoneyEarned,
  calculateProfitPerHour,
  calculateEquivalents,
  evaluateBadges,
  calculateStreak,
} from '../src/impact.js';

describe('Impact Formulas', () => {
  it('calculates waste grams correctly with pieces or explicit grams', () => {
    const items = [
      { pieces: 2, gramsPerPiece: 20 }, // 40g
      { grams: 15, gramsPerPiece: 2 },  // 15g explicit
    ];
    expect(calculateWasteGrams(items)).toBe(55);
  });

  it('calculates CO2 grams saved with 0.5 displacement factor', () => {
    // 2 plastic bottles (20g each = 40g = 0.04 kg) with co2PerKg = 2.3
    // Total CO2 = 0.04 * 2.3 = 0.092 kg CO2 = 92g
    // With displacement 0.5: 92 * 0.5 = 46g
    const items = [
      { pieces: 2, gramsPerPiece: 20, co2PerKg: 2.3 },
    ];
    expect(calculateCo2Grams(items, 0.5)).toBe(46);
  });

  it('calculates money earned and profit per hour', () => {
    expect(calculateMoneyEarned(50, 250)).toBe(200);
    expect(calculateMoneyEarned(100, 50)).toBe(0);
    expect(calculateMoneyEarned(100, null)).toBe(0);

    // 200 PKR profit in 30 minutes (0.5 hour) = 400 PKR/hr
    expect(calculateProfitPerHour(50, 250, 30)).toBe(400);
    // No profit
    expect(calculateProfitPerHour(250, 200, 30)).toBe(0);
  });

  it('calculates equivalents correctly', () => {
    const eq = calculateEquivalents({
      totalWasteG: 1000,
      totalCo2G: 850,
      plasticBottleG: 100, // 5 bottles
      bottleCapG: 20,      // 10 caps
    });

    const bottleEq = eq.find((e) => e.key === 'bottles-saved');
    expect(bottleEq?.count).toBe(5);

    const capEq = eq.find((e) => e.key === 'caps-saved');
    expect(capEq?.count).toBe(10);

    const phoneEq = eq.find((e) => e.key === 'phone-charges');
    expect(phoneEq?.count).toBe(Math.floor(850 / 8)); // 106

    const carEq = eq.find((e) => e.key === 'car-km');
    expect(carEq?.count).toBe(5); // 850 / 170 = 5.0
  });

  it('evaluates badge criteria accurately', () => {
    const badges = evaluateBadges({
      makesCount: 5,
      scansCount: 2,
      approvedMakesWithPhotoCount: 1,
      totalWasteG: 1200,
      plasticBottleG: 250, // > 200
      oldClothG: 600,     // > 500
      bestStreak: 4,
    });

    expect(badges).toContain('first-make');
    expect(badges).toContain('five-makes');
    expect(badges).toContain('streak-3');
    expect(badges).toContain('one-kg-club');
    expect(badges).toContain('bottle-hero');
    expect(badges).toContain('cloth-saver');
    expect(badges).toContain('sharing-is-caring');
    expect(badges).toContain('scanner');
  });

  it('calculates consecutive day streak correctly', () => {
    const dates = ['2026-11-10', '2026-11-11', '2026-11-12'];
    const result = calculateStreak(dates);
    expect(result.best).toBe(3);
  });
});

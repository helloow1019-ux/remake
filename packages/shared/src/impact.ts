import {
  REUSE_DISPLACEMENT_DEFAULT,
  BOTTLE_EQUIVALENT_GRAMS,
  CAP_EQUIVALENT_GRAMS,
  PHONE_CHARGE_CO2_GRAMS,
  CAR_KM_CO2_GRAMS,
  BadgeKey,
} from './constants.js';

export interface WasteItemInput {
  grams?: number;
  pieces?: number;
  gramsPerPiece: number;
  co2PerKg: number;
  wasteTypeSlug?: string;
}

export interface ImpactEquivalents {
  key: string;
  count: number;
  labelEn: string;
  labelUr: string;
}

/**
 * Calculates total waste in grams from an array of waste inputs.
 */
export function calculateWasteGrams(
  items: Array<{ grams?: number | null; pieces?: number | null; gramsPerPiece: number }>
): number {
  return items.reduce((total, item) => {
    if (typeof item.grams === 'number' && item.grams > 0) {
      return total + Math.round(item.grams);
    }
    const pieces = item.pieces ?? 1;
    return total + Math.round(pieces * item.gramsPerPiece);
  }, 0);
}

/**
 * Calculates estimated CO2e saved in grams.
 * Formula: round(sum( (grams / 1000) * co2PerKg ) * 1000 * REUSE_DISPLACEMENT)
 */
export function calculateCo2Grams(
  items: Array<{ grams?: number | null; pieces?: number | null; gramsPerPiece: number; co2PerKg: number }>,
  displacement = REUSE_DISPLACEMENT_DEFAULT
): number {
  const totalCo2 = items.reduce((sum, item) => {
    const itemGrams =
      typeof item.grams === 'number' && item.grams > 0
        ? item.grams
        : (item.pieces ?? 1) * item.gramsPerPiece;
    const kg = itemGrams / 1000;
    return sum + kg * item.co2PerKg;
  }, 0);

  return Math.round(totalCo2 * 1000 * displacement);
}

/**
 * Calculates money earned or potentially earned in PKR.
 * moneyPkr = max(0, (sellPricePkr ?? 0) - costPkr)
 */
export function calculateMoneyEarned(costPkr: number, sellPricePkr?: number | null): number {
  if (sellPricePkr == null || sellPricePkr <= 0) return 0;
  return Math.max(0, sellPricePkr - costPkr);
}

/**
 * Calculates profit per hour in PKR.
 * max(0, sell - cost) / (timeMinutes / 60)
 */
export function calculateProfitPerHour(
  costPkr: number,
  sellPricePkr: number | null | undefined,
  timeMinutes: number
): number {
  if (timeMinutes <= 0 || sellPricePkr == null || sellPricePkr <= costPkr) return 0;
  const profit = sellPricePkr - costPkr;
  const hours = timeMinutes / 60;
  return Math.round(profit / hours);
}

/**
 * Calculates fun everyday equivalents from total waste and CO2 saved.
 */
export function calculateEquivalents(params: {
  totalWasteG: number;
  totalCo2G: number;
  plasticBottleG?: number;
  bottleCapG?: number;
}): ImpactEquivalents[] {
  const result: ImpactEquivalents[] = [];

  // 1. Plastic bottles kept out of landfill
  const bottleG = params.plasticBottleG ?? 0;
  const bottlesCount = Math.floor(bottleG / BOTTLE_EQUIVALENT_GRAMS);
  if (bottlesCount > 0) {
    result.push({
      key: 'bottles-saved',
      count: bottlesCount,
      labelEn: `${bottlesCount} plastic bottles kept out of landfill`,
      labelUr: `${bottlesCount} پلاسٹک کی بوتلیں کچرے کے ڈھیر سے بچائیں`,
    });
  }

  // 2. Bottle caps
  const capG = params.bottleCapG ?? 0;
  const capsCount = Math.floor(capG / CAP_EQUIVALENT_GRAMS);
  if (capsCount > 0) {
    result.push({
      key: 'caps-saved',
      count: capsCount,
      labelEn: `${capsCount} bottle caps repurposed`,
      labelUr: `${capsCount} بوتلوں کے ڈھکن دوبارہ استعمال کیے`,
    });
  }

  // 3. Smartphone charges equivalent
  const phoneCharges = Math.floor(params.totalCo2G / PHONE_CHARGE_CO2_GRAMS);
  if (phoneCharges > 0) {
    result.push({
      key: 'phone-charges',
      count: phoneCharges,
      labelEn: `≈ ${phoneCharges} full smartphone charges in carbon saved`,
      labelUr: `تقریباً ${phoneCharges} اسمارٹ فون چارجز کے برابر کاربن کی بچت`,
    });
  }

  // 4. Car km not driven
  const carKm = Number((params.totalCo2G / CAR_KM_CO2_GRAMS).toFixed(1));
  if (carKm >= 0.5) {
    result.push({
      key: 'car-km',
      count: Math.round(carKm),
      labelEn: `≈ ${carKm} km not driven by a petrol car`,
      labelUr: `تقریباً ${carKm} کلومیٹر پیٹرول گاڑی نہ چلانے کے برابر`,
    });
  }

  return result;
}

/**
 * Evaluates which badges a user should hold given their activity metrics.
 */
export function evaluateBadges(metrics: {
  makesCount: number;
  scansCount: number;
  approvedMakesWithPhotoCount: number;
  totalWasteG: number;
  plasticBottleG: number;
  oldClothG: number;
  bestStreak: number;
}): BadgeKey[] {
  const earned: BadgeKey[] = [];

  if (metrics.makesCount >= 1) earned.push('first-make');
  if (metrics.makesCount >= 5) earned.push('five-makes');
  if (metrics.bestStreak >= 3) earned.push('streak-3');
  if (metrics.totalWasteG >= 1000) earned.push('one-kg-club');
  if (metrics.plasticBottleG >= 10 * BOTTLE_EQUIVALENT_GRAMS) earned.push('bottle-hero');
  if (metrics.oldClothG >= 500) earned.push('cloth-saver');
  if (metrics.approvedMakesWithPhotoCount >= 1) earned.push('sharing-is-caring');
  if (metrics.scansCount >= 1) earned.push('scanner');

  return earned;
}

/**
 * Calculate user streak based on an array of active date strings (YYYY-MM-DD format).
 */
export function calculateStreak(dates: string[]): { current: number; best: number } {
  if (dates.length === 0) return { current: 0, best: 0 };

  // Sort unique dates ascending
  const uniqueSorted = Array.from(new Set(dates)).sort();
  if (uniqueSorted.length === 0) return { current: 0, best: 0 };

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const parsedDates = uniqueSorted.map((d) => new Date(d + 'T00:00:00Z').getTime());

  let best = 1;
  let currentRun = 1;

  for (let i = 1; i < parsedDates.length; i++) {
    const prev = parsedDates[i - 1];
    const curr = parsedDates[i];
    if (prev === undefined || curr === undefined) continue;

    const diffDays = Math.round((curr - prev) / MS_PER_DAY);
    if (diffDays === 1) {
      currentRun++;
      if (currentRun > best) best = currentRun;
    } else if (diffDays > 1) {
      currentRun = 1;
    }
  }

  // Determine current streak: does the streak touch today or yesterday?
  const today = new Date().toISOString().slice(0, 10);
  const todayMs = new Date(today + 'T00:00:00Z').getTime();
  const lastActiveMs = parsedDates[parsedDates.length - 1];

  let current = 0;
  if (lastActiveMs !== undefined) {
    const daysSinceLast = Math.round((todayMs - lastActiveMs) / MS_PER_DAY);
    if (daysSinceLast === 0 || daysSinceLast === 1) {
      current = currentRun;
    }
  }

  return { current, best };
}

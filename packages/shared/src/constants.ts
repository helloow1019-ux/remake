export const USER_ROLES = ['USER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const IDEA_STATUSES = ['TESTED', 'UNTESTED', 'AI_DRAFT', 'ARCHIVED'] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export const IDEA_SOURCES = ['ADMIN', 'AI', 'SHEET'] as const;
export type IdeaSource = (typeof IDEA_SOURCES)[number];

export const MAKE_OUTCOMES = ['WORKED', 'PARTLY', 'FAILED'] as const;
export type MakeOutcome = (typeof MAKE_OUTCOMES)[number];

export const MAKE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type MakeStatus = (typeof MAKE_STATUSES)[number];

export const SCAN_MODES = ['LIVE', 'FALLBACK', 'MOCK'] as const;
export type ScanMode = (typeof SCAN_MODES)[number];

export const SUGGESTION_KINDS = ['WASTE', 'IDEA'] as const;
export type SuggestionKind = (typeof SUGGESTION_KINDS)[number];

export const SUGGESTION_STATUSES = ['NEW', 'REVIEWED', 'ARCHIVED'] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export const BADGE_KEYS = [
  'first-make',
  'five-makes',
  'streak-3',
  'one-kg-club',
  'bottle-hero',
  'cloth-saver',
  'sharing-is-caring',
  'scanner',
] as const;
export type BadgeKey = (typeof BADGE_KEYS)[number];

export const WASTE_TYPE_SLUGS = [
  'plastic-bottle',
  'bottle-cap',
  'food-scraps',
  'old-cloth',
  'cardboard',
  'glass-jar',
  'tin-can',
  'paper-newspaper',
  'plastic-bag',
  'tetra-pack',
  'other',
] as const;
export type WasteTypeSlug = (typeof WASTE_TYPE_SLUGS)[number];

// Impact Calculation Constants (doc 08_IMPACT_FORMULAS.md)
export const REUSE_DISPLACEMENT_DEFAULT = 0.5;
export const BOTTLE_EQUIVALENT_GRAMS = 20;
export const CAP_EQUIVALENT_GRAMS = 2;
export const PHONE_CHARGE_CO2_GRAMS = 8;
export const CAR_KM_CO2_GRAMS = 170;

// Banned / Hazard terms from doc 06_AI_GROQ.md
export const BANNED_HAZARD_TERMS = [
  'battery',
  'batteries',
  'lithium',
  'bleach',
  'acid',
  'pesticide',
  'insecticide',
  'solder',
  'open flame',
  'gasoline',
  'petrol',
  'kerosene',
  'medicine bottle for food',
  'asbestos',
  'firecracker',
] as const;

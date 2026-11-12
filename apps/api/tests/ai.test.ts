import { describe, it, expect, vi } from 'vitest';
import {
  validateVisionResult,
  validateIdeaGenResult,
  containsBannedTerms,
  extractJsonFromText,
} from '../src/ai/validators.js';
import { AiError } from '../src/ai/handlers.js';
import { MOCK_SCENARIOS } from '../src/ai/mock.js';

describe('AI Module Unit Tests', () => {
  it('extracts JSON from markdown code blocks', () => {
    const raw = '```json\n{"isWaste": true}\n```';
    expect(extractJsonFromText(raw)).toBe('{"isWaste": true}');
  });

  it('validates and clamps vision detection results', () => {
    const raw = {
      isWaste: true,
      overallConfidence: 1.5, // should clamp to 1.0
      items: [
        {
          label: 'Cardboard Scrap',
          wasteTypeSlug: 'cardboard',
          material: 'corrugated',
          estimatedPieces: 2,
          condition: 'clean',
          hazardous: false,
          confidence: 0.95,
        },
        {
          label: 'Unknown Item',
          wasteTypeSlug: 'unrecognized-slug', // should map to 'other'
          material: 'mixed',
          estimatedPieces: 1,
          condition: 'dirty',
          hazardous: false,
          confidence: 0.7,
        },
      ],
      warnings: [],
    };

    const validated = validateVisionResult(raw);
    expect(validated.overallConfidence).toBe(1);
    expect(validated.items[0]!.wasteTypeSlug).toBe('cardboard');
    expect(validated.items[1]!.wasteTypeSlug).toBe('other');
  });

  it('validates idea generation and enforces constraints', () => {
    const raw = {
      ideas: [
        {
          titleEn: 'Pen Stand',
          summaryEn: 'A nice desk cup made of cardboard.',
          difficulty: 1,
          timeMinutes: 2, // < 5, should clamp to 5
          costPkr: -10, // < 0, should clamp to 0
          sellPricePkr: 8000, // > 5000, should clamp to 5000
          materials: [{ nameEn: 'Cardboard', isWaste: true }],
          tools: [{ nameEn: 'Scissors' }],
          steps: [{ textEn: 'Cut neatly and fold.' }],
          safetyNoteEn: 'Careful with scissors',
          wasteUsed: [{ wasteTypeSlug: 'cardboard', pieces: 1 }],
        },
      ],
    };

    const validated = validateIdeaGenResult(raw);
    const idea = validated.ideas[0]!;
    expect(idea.timeMinutes).toBe(5);
    expect(idea.costPkr).toBe(0);
    expect(idea.sellPricePkr).toBe(5000);
    expect(idea.steps[0]!.position).toBe(1);
  });

  it('catches banned hazardous terms and refuses dangerous ideas', () => {
    expect(containsBannedTerms('Cut the plastic bottle with scissors.')).toBe(false);
    expect(containsBannedTerms('Remove the lithium battery before soldering.')).toBe(true);
    expect(containsBannedTerms('Use bleach to clean the mold.')).toBe(true);
    expect(containsBannedTerms('Heat using an open flame or petrol.')).toBe(true);

    const dangerousIdea = {
      ideas: [
        {
          titleEn: 'Battery Lamp',
          summaryEn: 'Extract the lithium battery and connect wires.',
          difficulty: 2,
          timeMinutes: 30,
          costPkr: 100,
          materials: [{ nameEn: 'Old battery' }],
          tools: [{ nameEn: 'Solder iron' }],
          steps: [{ textEn: 'Solder the battery leads.' }],
          safetyNoteEn: 'Wear glasses',
          wasteUsed: [{ wasteTypeSlug: 'other', pieces: 1 }],
        },
      ],
    };

    expect(() => validateIdeaGenResult(dangerousIdea)).toThrow(/banned hazard/i);
  });

  it('provides complete mock scenarios for offline and testing', () => {
    const plastic = MOCK_SCENARIOS['plastic-bottle'];
    expect(plastic).toBeDefined();
    expect(plastic!.detection.isWaste).toBe(true);
    expect(plastic!.ideas.length).toBe(3);

    const cloth = MOCK_SCENARIOS['old-cloth'];
    expect(cloth!.ideas.length).toBe(3);

    const cardboard = MOCK_SCENARIOS['cardboard'];
    expect(cardboard!.ideas.length).toBe(3);
  });
});

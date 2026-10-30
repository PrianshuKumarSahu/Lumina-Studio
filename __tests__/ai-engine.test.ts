import { describe, it, expect } from 'vitest';
import {
  generateIntelligentEventPlan,
  getEventPlannerSystemPrompt,
} from '@/lib/backend/gemini';

describe('AI Planning Engine Suite', () => {
  it('generates a specialized wedding blueprint with milestones, budget, and vendors', () => {
    const plan = generateIntelligentEventPlan('Generate plan for a royal wedding with 200 guests');
    expect(plan).toContain('Wedding Blueprint');
    expect(plan).toContain('Budget Allocation');
    expect(plan).toContain('Milestone Timeline');
    expect(plan).toContain('Vendor Checklist');
    expect(plan).toContain('Run of Show');
  });

  it('generates a tailored birthday blueprint with party timelines', () => {
    const plan = generateIntelligentEventPlan('30th Birthday bash for 50 friends');
    expect(plan).toContain('Birthday Blueprint');
    expect(plan).toContain('Budget Allocation');
    expect(plan).toContain('Creative Highlights');
  });

  it('generates a community festival plan with safety and permits', () => {
    const plan = generateIntelligentEventPlan('Community carnival and food festival');
    expect(plan).toContain('Community Celebration Blueprint');
    expect(plan.toLowerCase()).toContain('permit');
    expect(plan.toLowerCase()).toContain('volunteer');
  });

  it('provides a structured system persona for Lumina AI', () => {
    const prompt = getEventPlannerSystemPrompt();
    expect(prompt).toContain('Lumina AI');
    expect(prompt).toContain('celebration');
    expect(prompt).toContain('budget-conscious');
  });
});

import { NextRequest } from 'next/server';
import { askGemini, getEventPlannerSystemPrompt } from '@/lib/backend/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, guestCount, budget, targetDate, location, theme, additionalNotes } = body;

    const prompt = `Generate a comprehensive event plan with the following details:

**Event Type:** ${eventType}
**Guest Count:** ${guestCount}
**Total Budget:** ₹${budget}
**Target Date:** ${targetDate || 'Not set yet'}
**Location/City:** ${location || 'Not specified'}
**Theme/Vibe:** ${theme || 'Open to suggestions'}
**Additional Notes:** ${additionalNotes || 'None'}

Please provide:

1. **Event Summary** — A brief, exciting overview of the event concept (2–3 sentences).

2. **Budget Breakdown** — Allocate the ₹${budget} budget across these categories with specific amounts:
   - Venue
   - Catering & Food
   - Photography & Video
   - Music & Entertainment
   - Decorations & Flowers
   - Attire & Beauty (if applicable)
   - Invitations & Stationery
   - Transportation
   - Gifts & Favors
   - Contingency (10%)

3. **Timeline / Milestones** — Key preparation milestones organized by phase:
   - 6+ months out (3–4 items)
   - 3–6 months out (3–4 items)
   - Final weeks (3–4 items)
   - Day-of run of show (4–5 time-stamped items)

4. **Vendor Checklist** — Top 5–7 vendor categories to book, with 2 questions to ask each.

5. **Creative Ideas** — 5 unique, personalized ideas for making this event memorable (decor themes, signature drinks, activities, etc.).

6. **Color Palette** — Suggest 3–4 hex color codes that match the theme/vibe.

Format everything clearly with headers and bullet points.`;

    const result = await askGemini(prompt, getEventPlannerSystemPrompt());

    return Response.json({ result });
  } catch (error) {
    console.error('Plan generation error:', error);
    const message = error instanceof Error ? error.message : 'Plan generation failed';
    return Response.json({ error: message }, { status: 500 });
  }
}

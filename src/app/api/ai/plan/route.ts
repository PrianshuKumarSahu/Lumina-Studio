import { NextRequest } from 'next/server';
import { askGemini, getEventPlannerSystemPrompt } from '@/lib/backend/gemini';
import { checkRateLimit, sanitizeInput, PlanRequestSchema } from '@/lib/backend/security';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Protection
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    const rateCheck = checkRateLimit(`plan-${ip}`, 15, 60000);
    if (!rateCheck.success) {
      return Response.json(
        { error: 'Rate limit exceeded. Please wait a minute before requesting another blueprint.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateCheck.resetMs / 1000).toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // 2. Body parsing & Zod Validation
    const rawBody = await request.json();
    const parseResult = PlanRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || 'Invalid request parameters';
      return Response.json({ error: issue }, { status: 400 });
    }

    const { eventType, guestCount, budget, targetDate, location, theme, additionalNotes } = parseResult.data;

    // 3. Input Sanitization
    const cleanLocation = sanitizeInput(location);
    const cleanTheme = sanitizeInput(theme);
    const cleanNotes = sanitizeInput(additionalNotes);
    const cleanDate = sanitizeInput(targetDate);

    const prompt = `Generate a comprehensive event plan with the following details:

**Event Type:** ${eventType}
**Guest Count:** ${guestCount}
**Total Budget:** ₹${budget}
**Target Date:** ${cleanDate || 'Not set yet'}
**Location/City:** ${cleanLocation || 'Not specified'}
**Theme/Vibe:** ${cleanTheme || 'Open to suggestions'}
**Additional Notes:** ${cleanNotes || 'None'}

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

5. **Creative Ideas** — 5 unique, personalized ideas for making this event memorable.

6. **Color Palette** — Suggest 3–4 hex color codes that match the theme/vibe.

Format everything clearly with headers and bullet points.`;

    const result = await askGemini(prompt, getEventPlannerSystemPrompt());

    return Response.json(
      { result },
      {
        headers: {
          'X-RateLimit-Remaining': rateCheck.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Plan generation error:', error);
    const message = error instanceof Error ? error.message : 'Plan generation failed';
    return Response.json({ error: message }, { status: 500 });
  }
}

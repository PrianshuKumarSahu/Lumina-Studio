import { NextRequest } from 'next/server';
import { askGemini, getEventPlannerSystemPrompt } from '@/lib/backend/gemini';
import { checkRateLimit, sanitizeInput, GenerateRequestSchema } from '@/lib/backend/security';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Protection (30 requests/min)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    const rateCheck = checkRateLimit(`gen-${ip}`, 30, 60000);
    if (!rateCheck.success) {
      return Response.json(
        { error: 'Rate limit exceeded. Please wait a moment before sending more requests.' },
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
    const parseResult = GenerateRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || 'Invalid request parameters';
      return Response.json({ error: issue }, { status: 400 });
    }

    const { prompt, context } = parseResult.data;

    // 3. Input Sanitization
    const cleanPrompt = sanitizeInput(prompt);
    const cleanContext = sanitizeInput(context);

    const fullPrompt = cleanContext
      ? `Event Context:\n${cleanContext}\n\nUser Request:\n${cleanPrompt}`
      : cleanPrompt;

    const result = await askGemini(fullPrompt, getEventPlannerSystemPrompt());

    return Response.json(
      { result },
      {
        headers: {
          'X-RateLimit-Remaining': rateCheck.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('AI generation error:', error);
    const message = error instanceof Error ? error.message : 'AI generation failed';
    return Response.json({ error: message }, { status: 500 });
  }
}

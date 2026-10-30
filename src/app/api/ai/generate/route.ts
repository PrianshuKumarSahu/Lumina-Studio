import { NextRequest } from 'next/server';
import { askGemini, getEventPlannerSystemPrompt } from '@/lib/backend/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, context } = body;

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const fullPrompt = context
      ? `Event Context:\n${context}\n\nUser Request:\n${prompt}`
      : prompt;

    const result = await askGemini(fullPrompt, getEventPlannerSystemPrompt());

    return Response.json({ result });
  } catch (error) {
    console.error('AI generation error:', error);
    const message = error instanceof Error ? error.message : 'AI generation failed';
    return Response.json({ error: message }, { status: 500 });
  }
}

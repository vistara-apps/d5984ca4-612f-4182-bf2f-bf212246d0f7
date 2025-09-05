import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const generateScriptSchema = z.object({
  scenario: z.enum(['traffic_stop', 'search', 'arrest', 'other']),
  state: z.string(),
  language: z.enum(['english', 'spanish']),
  context: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenario, state, language, context } = generateScriptSchema.parse(body);

    const systemPrompt = `You are a legal rights assistant that generates clear, concise scripts for individuals during law enforcement interactions. Your responses must be:

1. Legally accurate for the specified state
2. Clear and easy to remember under stress
3. Non-confrontational but assertive
4. Focused on constitutional rights
5. Appropriate for the specific scenario

Generate 3-4 short, practical phrases that someone can use during a ${scenario} in ${state}. Each phrase should be one sentence and easy to remember.

${language === 'spanish' ? 'Respond in Spanish.' : 'Respond in English.'}`;

    const userPrompt = `Generate scripts for a ${scenario} scenario in ${state}${context ? `. Additional context: ${context}` : ''}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const generatedText = completion.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No response from OpenAI');
    }

    // Parse the response into individual scripts
    const scripts = generatedText
      .split('\n')
      .filter(line => line.trim() && !line.includes(':'))
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
      .filter(script => script.length > 0);

    return NextResponse.json({
      success: true,
      scripts,
      scenario,
      state,
      language,
    });
  } catch (error) {
    console.error('Generate script error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}

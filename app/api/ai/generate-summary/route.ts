import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createShareableCard } from '@/lib/supabase';
import { z } from 'zod';

// Initialize OpenAI client only when needed
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const generateSummarySchema = z.object({
  interactionLogId: z.string(),
  timestamp: z.string(),
  location: z.string(),
  interactionType: z.enum(['traffic_stop', 'search', 'arrest', 'other']),
  notes: z.string().optional(),
  state: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      interactionLogId,
      timestamp,
      location,
      interactionType,
      notes,
      state,
    } = generateSummarySchema.parse(body);

    const systemPrompt = `You are a legal documentation assistant that creates concise, professional summaries of law enforcement interactions. Your summaries should be:

1. Factual and objective
2. Include relevant legal rights information
3. Be suitable for sharing with legal counsel or support networks
4. Highlight key details that may be legally significant
5. Be clear and easy to understand

Create a professional summary that includes:
- A clear title
- A brief summary of what occurred
- Key rights that were relevant to the situation
- Any important details for legal reference

Keep the summary concise but comprehensive.`;

    const userPrompt = `Create a summary for a ${interactionType} that occurred on ${timestamp} in ${location}, ${state}.${notes ? ` Additional details: ${notes}` : ''}`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 800,
      temperature: 0.2,
    });

    const generatedText = completion.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No response from OpenAI');
    }

    // Extract title and summary from the generated text
    const lines = generatedText.split('\n').filter(line => line.trim());
    const title = lines[0]?.replace(/^(Title:|Summary:)/i, '').trim() || `${interactionType.replace('_', ' ')} - ${new Date(timestamp).toLocaleDateString()}`;
    const summary = lines.slice(1).join('\n').trim();

    // Generate relevant rights based on interaction type and state
    const rightsReferenced = [
      'Right to remain silent',
      'Right to refuse searches without a warrant',
      'Right to ask if you are free to leave',
      'Right to legal representation',
    ];

    // Create the shareable card content
    const generatedContent = {
      title,
      summary,
      timestamp,
      location,
      rights_referenced: rightsReferenced,
    };

    // Save to database
    const shareableCard = await createShareableCard({
      interaction_log_id: interactionLogId,
      generated_content: generatedContent,
    });

    return NextResponse.json({
      success: true,
      card: shareableCard,
      content: generatedContent,
    });
  } catch (error) {
    console.error('Generate summary error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const shareToFarcasterSchema = z.object({
  cardId: z.string(),
  content: z.object({
    title: z.string(),
    summary: z.string(),
    timestamp: z.string(),
    location: z.string(),
    rights_referenced: z.array(z.string()),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, content } = shareToFarcasterSchema.parse(body);

    // Create a shareable URL for the card
    const shareableUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${cardId}`;

    // Format the content for Farcaster
    const farcasterText = `🛡️ ${content.title}

📍 ${content.location}
🕐 ${new Date(content.timestamp).toLocaleString()}

${content.summary.substring(0, 200)}${content.summary.length > 200 ? '...' : ''}

Know your rights. Stay informed.

${shareableUrl}`;

    // For now, return the formatted text and URL
    // In a full implementation, you would use the Neynar API to post directly
    return NextResponse.json({
      success: true,
      farcasterText,
      shareableUrl,
      cardId,
    });
  } catch (error) {
    console.error('Share to Farcaster error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to share to Farcaster' },
      { status: 500 }
    );
  }
}

// Optional: Create a Farcaster Frame for the shared card
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      );
    }

    // Generate Frame metadata
    const frameMetadata = {
      'fc:frame': 'vNext',
      'fc:frame:image': `${process.env.NEXT_PUBLIC_APP_URL}/api/farcaster/frame-image/${cardId}`,
      'fc:frame:button:1': 'View Full Details',
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': `${process.env.NEXT_PUBLIC_APP_URL}/share/${cardId}`,
      'fc:frame:button:2': 'Know Your Rights',
      'fc:frame:button:2:action': 'link',
      'fc:frame:button:2:target': `${process.env.NEXT_PUBLIC_APP_URL}`,
    };

    return NextResponse.json({
      success: true,
      frameMetadata,
    });
  } catch (error) {
    console.error('Generate frame metadata error:', error);
    return NextResponse.json(
      { error: 'Failed to generate frame metadata' },
      { status: 500 }
    );
  }
}

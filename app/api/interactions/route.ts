import { NextRequest, NextResponse } from 'next/server';
import { createInteractionLog, getUserInteractionLogs, getUserByWalletAddress } from '@/lib/supabase';
import { PrivyApi } from '@privy-io/server-auth';
import { z } from 'zod';

const privy = new PrivyApi(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

const createInteractionSchema = z.object({
  accessToken: z.string(),
  walletAddress: z.string(),
  timestamp: z.string(),
  location: z.string().optional(),
  recorded_media_url: z.string().optional(),
  notes: z.string().optional(),
  interaction_type: z.enum(['traffic_stop', 'search', 'arrest', 'other']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accessToken,
      walletAddress,
      timestamp,
      location,
      recorded_media_url,
      notes,
      interaction_type,
    } = createInteractionSchema.parse(body);

    // Verify the access token with Privy
    const privyUser = await privy.verifyAuthToken(accessToken);
    
    if (!privyUser) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    // Check if wallet address matches the authenticated user
    const userWallet = privyUser.wallet?.address?.toLowerCase();
    if (userWallet !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Wallet address mismatch' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await getUserByWalletAddress(walletAddress.toLowerCase());
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create interaction log
    const interactionLog = await createInteractionLog({
      user_id: user.user_id,
      timestamp,
      location,
      recorded_media_url,
      notes,
      interaction_type,
    });

    return NextResponse.json({
      success: true,
      interaction: interactionLog,
    });
  } catch (error) {
    console.error('Create interaction error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create interaction log' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!walletAddress || !accessToken) {
      return NextResponse.json(
        { error: 'Wallet address and access token are required' },
        { status: 400 }
      );
    }

    // Verify the access token with Privy
    const privyUser = await privy.verifyAuthToken(accessToken);
    
    if (!privyUser) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    // Check if wallet address matches the authenticated user
    const userWallet = privyUser.wallet?.address?.toLowerCase();
    if (userWallet !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Wallet address mismatch' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await getUserByWalletAddress(walletAddress.toLowerCase());
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's interaction logs
    const interactions = await getUserInteractionLogs(user.user_id, limit);

    return NextResponse.json({
      success: true,
      interactions,
    });
  } catch (error) {
    console.error('Get interactions error:', error);
    return NextResponse.json(
      { error: 'Failed to get interaction logs' },
      { status: 500 }
    );
  }
}

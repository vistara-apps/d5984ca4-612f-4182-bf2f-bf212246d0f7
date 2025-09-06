import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';
import { upsertUser, getUserByWalletAddress } from '@/lib/supabase';
import { z } from 'zod';

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

const authSchema = z.object({
  accessToken: z.string(),
  walletAddress: z.string(),
  selectedState: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, walletAddress, selectedState } = authSchema.parse(body);

    // Verify the access token with Privy
    const claims = await privy.verifyAuthToken(accessToken);
    
    if (!claims) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    // Get user data from Privy using the user ID from claims
    const privyUser = await privy.getUser(claims.userId);
    
    if (!privyUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if wallet address matches one of the user's linked wallets
    const userWallet = privyUser.linkedAccounts
      ?.find(account => account.type === 'wallet')
      ?.address?.toLowerCase();
    
    if (userWallet !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Wallet address mismatch' },
        { status: 401 }
      );
    }

    // Create or update user in database
    const userData = await upsertUser({
      wallet_address: walletAddress.toLowerCase(),
      selected_state: selectedState,
      subscription_status: 'free',
    });

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('Auth error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const user = await getUserByWalletAddress(walletAddress.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

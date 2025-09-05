import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUserByWalletAddress } from '@/lib/supabase';
import { PrivyApi } from '@privy-io/server-auth';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const privy = new PrivyApi(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

const createCheckoutSchema = z.object({
  accessToken: z.string(),
  walletAddress: z.string(),
  priceId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, walletAddress, priceId } = createCheckoutSchema.parse(body);

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

    // Create or retrieve Stripe customer
    let customerId = user.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          wallet_address: walletAddress.toLowerCase(),
          user_id: user.user_id,
        },
      });
      customerId = customer.id;
    }

    // Default price ID for premium subscription ($5/month)
    const defaultPriceId = priceId || process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: defaultPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        wallet_address: walletAddress.toLowerCase(),
        user_id: user.user_id,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

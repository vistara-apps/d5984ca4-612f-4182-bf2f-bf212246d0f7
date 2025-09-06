import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { headers } from 'next/headers';
import { Database } from '@/lib/database.types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription') {
          const walletAddress = session.metadata?.wallet_address;
          const customerId = session.customer as string;

          if (walletAddress) {
            // Update user subscription status
            await (supabaseAdmin.from('users') as any)
              .update({
                subscription_status: 'premium',
                stripe_customer_id: customerId,
                updated_at: new Date().toISOString(),
              })
              .eq('wallet_address', walletAddress);

            console.log(`Updated subscription for wallet: ${walletAddress}`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get customer to find wallet address
        const customer = await stripe.customers.retrieve(customerId);

        if (
          customer &&
          !customer.deleted &&
          customer.metadata?.wallet_address
        ) {
          const walletAddress = customer.metadata.wallet_address;
          const status = subscription.status === 'active' ? 'premium' : 'free';

          await (supabaseAdmin.from('users') as any)
            .update({
              subscription_status: status,
              updated_at: new Date().toISOString(),
            })
            .eq('wallet_address', walletAddress);

          console.log(
            `Updated subscription status to ${status} for wallet: ${walletAddress}`
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get customer to find wallet address
        const customer = await stripe.customers.retrieve(customerId);

        if (
          customer &&
          !customer.deleted &&
          customer.metadata?.wallet_address
        ) {
          const walletAddress = customer.metadata.wallet_address;

          await (supabaseAdmin.from('users') as any)
            .update({
              subscription_status: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('wallet_address', walletAddress);

          console.log(`Cancelled subscription for wallet: ${walletAddress}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Get customer to find wallet address
        const customer = await stripe.customers.retrieve(customerId);

        if (
          customer &&
          !customer.deleted &&
          customer.metadata?.wallet_address
        ) {
          const walletAddress = customer.metadata.wallet_address;

          // Optionally downgrade to free tier on payment failure
          await (supabaseAdmin.from('users') as any)
            .update({
              subscription_status: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('wallet_address', walletAddress);

          console.log(`Payment failed, downgraded wallet: ${walletAddress}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

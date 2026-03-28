import { NextRequest, NextResponse } from 'next/server';

// Ensure this route runs in the Node.js runtime (Stripe's SDK is not Edge-compatible)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    // Dynamically import and initialize Stripe at runtime only
    const Stripe = (await import('stripe')).default;
    const secret = process.env.STRIPE_SECRET_KEY;
    
    if (!secret) {
      return NextResponse.json(
        { error: 'Stripe secret key is not configured on the server' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'aud',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Unexpected error creating payment intent' },
      { status: 500 }
    );
  }
}

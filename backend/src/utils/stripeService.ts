import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any, // Use stable version
});

export const createStripeCustomer = async (email: string, name?: string) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {}
) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
    return session;
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw error;
  }
};

export const handleWebhook = (payload: string | Buffer, sig: string, webhookSecret: string) => {
  try {
    const event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};

export default stripe;

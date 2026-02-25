import Stripe from 'stripe'

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function createPaymentIntent(amount: number, orderId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'vnd',
      metadata: {
        orderId,
      },
      description: `MoveUp Order ${orderId}`,
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error('Stripe error:', error)
    throw error
  }
}

export function formatPriceForStripe(price: number): number {
  return Math.round(price * 100)
}

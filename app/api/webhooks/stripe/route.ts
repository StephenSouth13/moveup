import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle payment intent events
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any
    const orderId = paymentIntent.metadata.orderId

    try {
      const supabase = await createClient()

      // Update order status to completed
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          stripe_payment_id: paymentIntent.id,
        })
        .eq('id', orderId)
        .select()
        .single()

      if (orderError) {
        console.error('Error updating order:', orderError)
        return NextResponse.json(
          { error: 'Error updating order' },
          { status: 500 }
        )
      }

      // Create enrollments for each course in the order
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          // Check if enrollment already exists
          const { data: existingEnrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', order.user_id)
            .eq('course_id', item.course_id)
            .single()

          // Create enrollment if it doesn't exist
          if (!existingEnrollment) {
            await supabase
              .from('enrollments')
              .insert([{
                user_id: order.user_id,
                course_id: item.course_id,
                status: 'active',
                progress_percent: 0,
              }])
          }
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      return NextResponse.json(
        { error: 'Error processing payment' },
        { status: 500 }
      )
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as any
    const orderId = paymentIntent.metadata.orderId

    try {
      const supabase = await createClient()

      // Update order status to failed
      await supabase
        .from('orders')
        .update({
          status: 'failed',
          stripe_payment_id: paymentIntent.id,
        })
        .eq('id', orderId)
    } catch (error) {
      console.error('Error updating failed payment:', error)
    }
  }

  return NextResponse.json({ received: true })
}

import { createClient } from '@/lib/supabase/server'
import { createPaymentIntent } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      )
    }

    // Get user session
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Create payment intent
    const paymentData = await createPaymentIntent(order.total_amount, orderId)

    return NextResponse.json(paymentData)
  } catch (error: any) {
    console.error('Payment intent error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

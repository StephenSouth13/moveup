'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Order {
  id: string
  total_amount: number
  status: string
  order_items: Array<{
    course: {
      title: string
      price: number
    }
  }>
}

export default function CheckoutPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadOrder = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }

      setUser(authUser)

      const { data } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          order_items(
            course:courses(title, price)
          )
        `)
        .eq('id', params.orderId)
        .eq('user_id', authUser.id)
        .single()

      if (data) {
        setOrder(data)
      }

      setIsLoading(false)
    }

    loadOrder()
  }, [params.orderId, router, supabase])

  const handlePayment = async () => {
    if (!order) return

    setIsProcessing(true)

    // TODO: Integrate with Stripe
    // For now, simulate payment success
    setTimeout(async () => {
      // Mark order as completed
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', order.id)

      if (!error) {
        // Create enrollments for each course
        const orderItems = order.order_items || []
        for (const item of orderItems) {
          await supabase
            .from('enrollments')
            .insert([{
              user_id: user.id,
              course_id: item.course_id,
              status: 'active',
            }])
        }

        router.push(`/payment-success/${order.id}`)
      }

      setIsProcessing(false)
    }, 2000)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Đang tải...</p></div>
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Không tìm thấy đơn hàng</p>
          <Link href="/dashboard">
            <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg">
              Quay lại dashboard
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/cart" className="text-sm text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Quay lại giỏ hàng
        </Link>

        <h1 className="text-3xl font-light text-slate-900 mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 p-8">
              <h2 className="text-lg font-light text-slate-900 mb-6">Thông tin thanh toán</h2>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Số thẻ
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Ngày hết hạn
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? 'Đang xử lý...' : 'Thanh toán ngay'}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 h-fit">
            <h2 className="text-lg font-light text-slate-900 mb-6">Tóm tắt đơn hàng</h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
              {(order.order_items || []).map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-slate-600">{item.course?.title}</span>
                  <span className="font-medium text-slate-900">
                    {((item.course?.price || 0) / 1000000).toFixed(1)}M đ
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between mb-6">
              <span className="text-slate-600">Tạm tính</span>
              <span className="font-medium text-slate-900">
                {(order.total_amount / 1000000).toFixed(1)}M đ
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-light text-slate-900">Tổng cộng</span>
              <span className="text-2xl font-light text-slate-900">
                {(order.total_amount / 1000000).toFixed(1)}M đ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface CartItem {
  id: string
  course_id: string
  course: {
    id: string
    title: string
    price: number
    instructor: string
    image: string
  }
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadCart = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }

      setUser(authUser)

      const { data } = await supabase
        .from('cart_items')
        .select(`
          id,
          course_id,
          course:courses(id, title, price, instructor, image)
        `)
        .eq('user_id', authUser.id)

      setCartItems(data || [])
      setIsLoading(false)
    }

    loadCart()
  }, [router, supabase])

  const handleRemoveItem = async (cartItemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)

    if (!error) {
      setCartItems(cartItems.filter(item => item.id !== cartItemId))
    }
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.course?.price || 0), 0)

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: user.id,
        total_amount: total,
        status: 'pending',
        payment_method: 'stripe',
      }])
      .select()
      .single()

    if (orderError) {
      alert('Lỗi khi tạo đơn hàng')
      return
    }

    // Add order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      course_id: item.course_id,
      price_at_purchase: item.course?.price || 0,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      alert('Lỗi khi thêm sản phẩm vào đơn hàng')
      return
    }

    // Clear cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    // Redirect to payment
    router.push(`/checkout/${order.id}`)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Đang tải...</p></div>
  }

  const total = cartItems.reduce((sum, item) => sum + (item.course?.price || 0), 0)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-light text-slate-900">MoveUp</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-light text-slate-900 mb-8">Giỏ hàng</h1>

        {cartItems.length === 0 ? (
          <div className="bg-slate-50 rounded-lg p-12 text-center">
            <p className="text-slate-600 mb-6">Giỏ hàng của bạn trống</p>
            <Link href="/courses">
              <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg">
                Tiếp tục mua sắm
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-6 flex gap-6">
                    <div className="relative w-32 h-24 flex-shrink-0 bg-slate-100 rounded">
                      <Image
                        src={item.course?.image || '/placeholder.jpg'}
                        alt={item.course?.title || 'Course'}
                        fill
                        className="object-cover rounded saturate-0"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-slate-900 mb-1">
                        {item.course?.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-3">
                        Giảng viên: {item.course?.instructor}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-light text-slate-900">
                          {((item.course?.price || 0) / 1000000).toFixed(1)}M đ
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 rounded-lg p-6 h-fit sticky top-24">
              <h2 className="text-lg font-light text-slate-900 mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính ({cartItems.length} khóa)</span>
                  <span>{(total / 1000000).toFixed(1)}M đ</span>
                </div>
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-lg font-light text-slate-900">Tổng cộng</span>
                <span className="text-2xl font-light text-slate-900">
                  {(total / 1000000).toFixed(1)}M đ
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thanh toán
              </button>
              <Link href="/courses">
                <button className="w-full mt-3 px-6 py-3 border border-slate-200 text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors">
                  Tiếp tục mua sắm
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

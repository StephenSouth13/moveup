'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Order {
  id: string
  user_id: string
  total_amount: number
  status: string
  created_at: string
  payment_method: string
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)

      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      setOrders(data || [])
      setIsLoading(false)
    }

    fetchOrders()
  }, [router, supabase])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (!error) {
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ))
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Đang tải...</p></div>
  }

  if (!isAdmin) return null

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total_amount, 0)

  const pendingOrders = orders.filter(o => o.status === 'pending').length

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/admin">
            <span className="text-xl font-light text-slate-900">MoveUp Admin</span>
          </Link>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-6">
          <nav className="space-y-2">
            <Link href="/admin" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">
              Dashboard
            </Link>
            <Link href="/admin/courses" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">
              Quản lý khóa học
            </Link>
            <Link href="/admin/students" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">
              Quản lý học viên
            </Link>
            <Link href="/admin/orders" className="block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">
              Đơn hàng
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-light text-slate-900 mb-8">Quản lý đơn hàng</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-sm font-medium text-slate-600 mb-2">Tổng đơn hàng</p>
                <p className="text-3xl font-light text-slate-900">{orders.length}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-sm font-medium text-slate-600 mb-2">Chờ xử lý</p>
                <p className="text-3xl font-light text-slate-900">{pendingOrders}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-sm font-medium text-slate-600 mb-2">Tổng doanh thu</p>
                <p className="text-3xl font-light text-slate-900">{(totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <p className="text-slate-600">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Mã đơn</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Số tiền</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Phương thức thanh toán</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Ngày tạo</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {(order.total_amount / 1000000).toFixed(1)}M đ
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{order.payment_method || 'Stripe'}</td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`px-3 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                              order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="failed">Thất bại</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Link href={`/admin/orders/${order.id}`}>
                            <button className="text-blue-600 hover:text-blue-700">Chi tiết</button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

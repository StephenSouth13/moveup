'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AdminStats {
  totalCourses: number
  totalStudents: number
  totalRevenue: number
  pendingOrders: number
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<AdminStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setUser(user)
      setIsAdmin(true)

      // Fetch stats
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('id', { count: 'exact' })

      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'student')

      const { data: orders } = await supabase.from('orders').select('total_amount, status')

      const totalRevenue = orders?.reduce((sum, order) => (order.status === 'completed' ? sum + order.total_amount : sum), 0) || 0
      const pendingOrders = orders?.filter((order) => order.status === 'pending').length || 0

      setStats({
        totalCourses: coursesCount || 0,
        totalStudents: studentsCount || 0,
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders,
      })

      setIsLoading(false)
    }

    checkAdmin()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Đang tải...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-light text-slate-900">MoveUp Admin</span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-600">Admin</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className="flex">
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-6">
          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/courses"
              className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Quản lý khóa học
            </Link>
            <Link
              href="/admin/students"
              className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Quản lý học viên
            </Link>
            <Link
              href="/admin/orders"
              className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Đơn hàng
            </Link>
            <Link
              href="/admin/analytics"
              className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Thống kê
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-light text-slate-900 mb-8">Dashboard quản trị</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-sm font-medium text-slate-600 mb-2">Tổng khóa học</p>
                <p className="text-4xl font-light text-slate-900">{stats.totalCourses}</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-sm font-medium text-slate-600 mb-2">Tổng học viên</p>
                <p className="text-4xl font-light text-slate-900">{stats.totalStudents}</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-sm font-medium text-slate-600 mb-2">Doanh thu</p>
                <p className="text-4xl font-light text-slate-900">
                  {(stats.totalRevenue / 1000000).toFixed(1)}M
                </p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-sm font-medium text-slate-600 mb-2">Đơn hàng chờ xử lý</p>
                <p className="text-4xl font-light text-slate-900">{stats.pendingOrders}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-light text-slate-900 mb-6">Tác vụ nhanh</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/courses/new">
                  <button className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Thêm khóa học mới
                  </button>
                </Link>
                <Link href="/admin/orders">
                  <button className="w-full px-6 py-3 border border-slate-200 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                    Xem đơn hàng chờ xử lý
                  </button>
                </Link>
                <Link href="/admin/analytics">
                  <button className="w-full px-6 py-3 border border-slate-200 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                    Xem thống kê chi tiết
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

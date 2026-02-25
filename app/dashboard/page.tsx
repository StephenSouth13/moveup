'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email?: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
      }
      setIsLoading(false)
    }

    checkUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-light text-slate-900">MoveUp</span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <Link href="/courses">
            <button className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Khám phá khóa học
            </button>
          </Link>
          <Link href="/cart">
            <button className="w-full px-6 py-3 border border-slate-200 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Xem giỏ hàng
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Enrolled Courses Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Khóa học đã đăng ký</h3>
            <p className="text-3xl font-light text-slate-900">-</p>
          </div>

          {/* In Progress Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Đang học</h3>
            <p className="text-3xl font-light text-slate-900">-</p>
          </div>

          {/* Completed Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Hoàn thành</h3>
            <p className="text-3xl font-light text-slate-900">-</p>
          </div>
        </div>

        {/* Enrolled Courses Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-2xl font-light text-slate-900 mb-6">Khóa học của bạn</h2>
          <p className="text-slate-500 text-center py-12">
            Bạn chưa đăng ký khóa học nào. Hãy{' '}
            <Link href="/courses" className="text-blue-600 hover:text-blue-700">
              khám phá các khóa học
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  )
}

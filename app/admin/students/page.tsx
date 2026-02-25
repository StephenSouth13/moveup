'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Student {
  id: string
  first_name: string
  last_name: string
  phone: string
  created_at: string
  email: string
  enrollments_count: number
}

export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchStudents = async () => {
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

      // Fetch students with their enrollment count
      const { data: studentData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false })

      // Get email for each student
      const studentsWithEmail = await Promise.all(
        (studentData || []).map(async (student) => {
          const { data: { user } } = await supabase.auth.admin.getUserById(student.id)
          return {
            ...student,
            email: user?.email || 'N/A',
            enrollments_count: 0,
          }
        })
      )

      setStudents(studentsWithEmail)
      setIsLoading(false)
    }

    fetchStudents()
  }, [router, supabase])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Đang tải...</p></div>
  }

  if (!isAdmin) return null

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
            <Link href="/admin/students" className="block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">
              Quản lý học viên
            </Link>
            <Link href="/admin/orders" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">
              Đơn hàng
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-light text-slate-900">Quản lý học viên</h1>
              <div className="flex gap-3">
                <input
                  type="search"
                  placeholder="Tìm kiếm học viên..."
                  className="px-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {students.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <p className="text-slate-600">Chưa có học viên nào</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Tên</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Điện thoại</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Khóa học đã đăng ký</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Ngày tham gia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{student.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{student.phone || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{student.enrollments_count}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(student.created_at).toLocaleDateString('vi-VN')}
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

'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Certificate {
  id: string
  enrollment_id: string
  issued_at: string
  course_title: string
  student_name: string
  student_email: string
}

export default function CertificatesAdmin() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCertificates = async () => {
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
        .from('certificates')
        .select(`
          id,
          enrollment_id,
          issued_at,
          enrollment:enrollments(
            course:courses(title),
            user:profiles(first_name, last_name)
          )
        `)
        .order('issued_at', { ascending: false })

      if (data) {
        const formattedCerts = data.map(cert => ({
          id: cert.id,
          enrollment_id: cert.enrollment_id,
          issued_at: cert.issued_at,
          course_title: cert.enrollment?.course?.title || 'Course',
          student_name: `${cert.enrollment?.user?.first_name || ''} ${cert.enrollment?.user?.last_name || ''}`.trim(),
          student_email: 'N/A',
        }))
        setCertificates(formattedCerts)
      }

      setIsLoading(false)
    }

    fetchCertificates()
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
            <Link href="/admin/students" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">
              Quản lý học viên
            </Link>
            <Link href="/admin/orders" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">
              Đơn hàng
            </Link>
            <Link href="/admin/certificates" className="block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">
              Chứng chỉ
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-light text-slate-900 mb-8">Quản lý chứng chỉ</h1>

            {certificates.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <p className="text-slate-600">Chưa có chứng chỉ nào</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Mã chứng chỉ</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Học viên</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Khóa học</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Ngày cấp</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {certificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-mono text-slate-900">
                          {cert.id.slice(0, 12)}...
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{cert.student_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{cert.course_title}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(cert.issued_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-blue-600 hover:text-blue-700">Xem chi tiết</button>
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

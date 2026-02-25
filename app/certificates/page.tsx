'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Certificate {
  id: string
  enrollment_id: string
  issued_at: string
  valid_until: string
  course_title: string
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadCertificates = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }

      setUser(authUser)

      const { data } = await supabase
        .from('certificates')
        .select(`
          id,
          enrollment_id,
          issued_at,
          valid_until,
          enrollment:enrollments(
            course:courses(title)
          )
        `)
        .eq('enrollments.user_id', authUser.id)
        .order('issued_at', { ascending: false })

      if (data) {
        const formattedCerts = data.map(cert => ({
          id: cert.id,
          enrollment_id: cert.enrollment_id,
          issued_at: cert.issued_at,
          valid_until: cert.valid_until,
          course_title: cert.enrollment?.course?.title || 'Khóa học',
        }))
        setCertificates(formattedCerts)
      }

      setIsLoading(false)
    }

    loadCertificates()
  }, [router, supabase])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Đang tải...</p></div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-light text-slate-900">MoveUp</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/courses" className="text-sm text-slate-600 hover:text-slate-900">
              Khóa học
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-light text-slate-900 mb-8">Chứng chỉ của tôi</h1>

        {certificates.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600 mb-6">
              Bạn chưa có chứng chỉ nào. Hoàn thành các khóa học để nhận chứng chỉ.
            </p>
            <Link href="/courses">
              <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                Khám phá khóa học
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Certificate Card */}
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-slate-100 border-b border-slate-200 flex items-center justify-center p-6 relative">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                      </svg>
                    </div>
                    <p className="font-light text-slate-900 text-sm">Chứng chỉ hoàn thành</p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-light text-slate-900 mb-2 line-clamp-2">
                    {cert.course_title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Cấp ngày: {new Date(cert.issued_at).toLocaleDateString('vi-VN')}
                  </p>
                  {cert.valid_until && (
                    <p className="text-xs text-slate-500 mb-4">
                      Hợp lệ đến: {new Date(cert.valid_until).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                  <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors text-sm">
                    Tải xuống
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

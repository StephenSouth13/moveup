'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  description: string
  level: string
  price: number
  is_published: boolean
  created_at: string
  total_lessons: number
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCourses = async () => {
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
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      setCourses(data || [])
      setIsLoading(false)
    }

    fetchCourses()
  }, [router, supabase])

  const handleDelete = async (courseId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (!error) {
      setCourses(courses.filter(c => c.id !== courseId))
    }
  }

  const handlePublish = async (courseId: string, isPublished: boolean) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_published: !isPublished })
      .eq('id', courseId)

    if (!error) {
      setCourses(courses.map(c => 
        c.id === courseId ? { ...c, is_published: !isPublished } : c
      ))
    }
  }

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
            <Link href="/admin/courses" className="block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">
              Quản lý khóa học
            </Link>
            <Link href="/admin/students" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">
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
              <h1 className="text-3xl font-light text-slate-900">Quản lý khóa học</h1>
              <Link href="/admin/courses/new">
                <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                  Thêm khóa học
                </button>
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <p className="text-slate-600 mb-4">Chưa có khóa học nào</p>
                <Link href="/admin/courses/new">
                  <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                    Tạo khóa học đầu tiên
                  </button>
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Tên khóa học</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Cấp độ</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Giá</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Bài học</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{course.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{course.level}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{(course.price / 1000000).toFixed(1)}M đ</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{course.total_lessons}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            course.is_published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {course.is_published ? 'Đã xuất bản' : 'Nháp'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <Link href={`/admin/courses/${course.id}/edit`}>
                              <button className="text-blue-600 hover:text-blue-700">Sửa</button>
                            </Link>
                            <button
                              onClick={() => handlePublish(course.id, course.is_published)}
                              className="text-slate-600 hover:text-slate-700"
                            >
                              {course.is_published ? 'Ẩn' : 'Xuất bản'}
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Xóa
                            </button>
                          </div>
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

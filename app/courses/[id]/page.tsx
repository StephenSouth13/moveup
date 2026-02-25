'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  level: string
  price: number
  duration_hours: number
  total_lessons: number
  image: string
  is_published: boolean
}

export default function CourseDetail({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Load course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', params.id)
        .eq('is_published', true)
        .single()

      if (courseData) {
        setCourse(courseData)

        // Check if user is enrolled
        if (user) {
          const { data: enrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', params.id)
            .single()

          if (enrollment) {
            setIsEnrolled(true)
          }
        }
      }

      setIsLoading(false)
    }

    loadData()
  }, [params.id, supabase])

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    setIsAddingToCart(true)

    const { error } = await supabase
      .from('cart_items')
      .insert([{ user_id: user.id, course_id: params.id }])
      .select()

    setIsAddingToCart(false)

    if (!error) {
      router.push('/cart')
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Đang tải...</p></div>
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Khóa học không tìm thấy</p>
          <Link href="/courses">
            <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg">
              Quay lại danh sách khóa học
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-light text-slate-900">MoveUp</span>
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link href="/courses" className="text-sm text-slate-600 hover:text-slate-900">Khóa học</Link>
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">Dashboard</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <Link href="/courses" className="text-sm text-blue-600 hover:text-blue-700 mb-6 inline-block">
            ← Quay lại danh sách
          </Link>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-slate-900 mb-4">
            {course.title}
          </h1>
          <p className="text-lg text-slate-500 mb-8">{course.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div>
              <p className="text-sm text-slate-600">Cấp độ</p>
              <p className="text-lg font-medium text-slate-900">{course.level}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Bài học</p>
              <p className="text-lg font-medium text-slate-900">{course.total_lessons}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Thời lượng</p>
              <p className="text-lg font-medium text-slate-900">{course.duration_hours}h</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Giá</p>
              <p className="text-lg font-medium text-slate-900">{(course.price / 1000000).toFixed(1)}M đ</p>
            </div>
          </div>

          <div className="flex gap-4">
            {isEnrolled ? (
              <Link href={`/learn/${course.id}`}>
                <button className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700">
                  Tiếp tục học
                </button>
              </Link>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isAddingToCart ? 'Đang xử lý...' : 'Thêm vào giỏ hàng'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-50 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-light text-slate-900 mb-4">Về khóa học này</h2>
            <p className="text-slate-600 leading-relaxed">{course.description}</p>
            <p className="text-slate-600 mt-4">Giảng viên: <span className="font-medium text-slate-900">{course.instructor}</span></p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-8">
            <h2 className="text-2xl font-light text-slate-900 mb-4">Chương trình học</h2>
            <p className="text-slate-600">Sắp có cập nhật chi tiết về chương trình học...</p>
          </div>
        </div>
      </section>
    </div>
  )
}

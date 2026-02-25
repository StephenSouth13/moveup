'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Lesson {
  id: string
  title: string
  description: string
  video_url: string
  transcript: string
  duration_minutes: number
  order: number
}

interface Enrollment {
  id: string
  progress_percent: number
  status: string
}

interface Course {
  id: string
  title: string
  description: string
  total_lessons: number
  lessons: Lesson[]
}

export default function LessonPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [lessonProgress, setLessonProgress] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [videoProgress, setVideoProgress] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }

      setUser(authUser)

      // Load course with lessons
      const { data: courseData } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          total_lessons,
          lessons(
            id,
            title,
            description,
            video_url,
            transcript,
            duration_minutes,
            order
          )
        `)
        .eq('id', params.courseId)
        .eq('is_published', true)
        .single()

      if (courseData) {
        setCourse({
          ...courseData,
          lessons: (courseData.lessons || []).sort((a: Lesson, b: Lesson) => a.order - b.order),
        })

        // Load enrollment
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('id, progress_percent, status')
          .eq('user_id', authUser.id)
          .eq('course_id', params.courseId)
          .single()

        if (enrollmentData) {
          setEnrollment(enrollmentData)

          // Load first lesson
          if (courseData.lessons && courseData.lessons.length > 0) {
            setCurrentLesson(courseData.lessons[0])

            // Load progress for first lesson
            const { data: progressData } = await supabase
              .from('lesson_progress')
              .select('*')
              .eq('enrollment_id', enrollmentData.id)
              .eq('lesson_id', courseData.lessons[0].id)
              .single()

            setLessonProgress(progressData)
          }
        } else {
          // Not enrolled
          router.push(`/courses/${params.courseId}`)
          return
        }
      }

      setIsLoading(false)
    }

    loadData()
  }, [params.courseId, router, supabase])

  const handleLessonSelect = async (lesson: Lesson) => {
    setCurrentLesson(lesson)
    setVideoProgress(0)

    // Load progress for this lesson
    if (enrollment) {
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('enrollment_id', enrollment.id)
        .eq('lesson_id', lesson.id)
        .single()

      setLessonProgress(progressData)
    }
  }

  const handleMarkComplete = async () => {
    if (!currentLesson || !enrollment) return

    const { data: existingProgress } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('enrollment_id', enrollment.id)
      .eq('lesson_id', currentLesson.id)
      .single()

    if (existingProgress) {
      // Update
      await supabase
        .from('lesson_progress')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id)
    } else {
      // Insert
      await supabase
        .from('lesson_progress')
        .insert([{
          enrollment_id: enrollment.id,
          lesson_id: currentLesson.id,
          is_completed: true,
          completed_at: new Date().toISOString(),
        }])
    }

    setLessonProgress({ is_completed: true })
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Đang tải...</p></div>
  }

  if (!course || !enrollment || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Không thể tải khóa học</p>
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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <span className="text-xl font-light text-slate-900">MoveUp Learning</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Tiến độ: {enrollment.progress_percent}%</span>
            <Link href="/dashboard">
              <button className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
                Quay lại
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Lessons List */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-light text-slate-900 mb-4">{course.title}</h2>
            <div className="space-y-2">
              {course.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => handleLessonSelect(lesson)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    currentLesson.id === lesson.id
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      lessonProgress?.is_completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-slate-300'
                    }`}>
                      {lessonProgress?.is_completed && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{lesson.title}</p>
                      <p className="text-xs text-slate-500">{lesson.duration_minutes} phút</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-light text-slate-900 mb-4">{currentLesson.title}</h1>
            <p className="text-slate-600 mb-8">{currentLesson.description}</p>

            {/* Video Player Placeholder */}
            <div className="bg-slate-900 rounded-lg overflow-hidden mb-8 aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-75" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  <path fillRule="evenodd" d="M14.414 9.414a2 2 0 00-2.828-2.828L7 10.586 5.414 9a2 2 0 00-2.828 2.828l2 2a2 2 0 002.828 0l7-7a2 2 0 000-2.828z" clipRule="evenodd" />
                </svg>
                <p>Video Player</p>
                <p className="text-sm opacity-75">URL: {currentLesson.video_url}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">Tiến độ video</span>
                <span className="text-sm text-slate-600">{videoProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleMarkComplete}
              className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                lessonProgress?.is_completed
                  ? 'bg-green-100 text-green-900'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {lessonProgress?.is_completed ? '✓ Đã hoàn thành' : 'Đánh dấu là hoàn thành'}
            </button>

            {/* Transcript */}
            {currentLesson.transcript && (
              <div className="mt-12 bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-light text-slate-900 mb-4">Bản ghi chép</h2>
                <p className="text-slate-600 leading-relaxed">{currentLesson.transcript}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

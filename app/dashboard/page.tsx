'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// Types khớp với Database Schema
interface Enrollment {
  id: string
  courses: {
    id: string
    title: string
    thumbnail_url: string
  }
  lesson_progress: { completed: boolean }[]
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // Fetch Enrollments join Courses và Lesson Progress
      const { data } = await supabase
        .from('enrollments')
        .select(`
          id,
          courses (id, title, thumbnail_url),
          lesson_progress (completed)
        `)
        .eq('user_id', user.id)

      setEnrollments(data as any || [])
      setIsLoading(false)
    }

    fetchDashboardData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-montserrat tracking-widest text-[10px] uppercase">Loading...</div>

  // Tính toán chỉ số thực tế từ Database
  const completedCourses = enrollments.filter(e => 
    e.lesson_progress.length > 0 && e.lesson_progress.every(p => p.completed)
  ).length

  return (
    <div className="min-h-screen bg-white font-montserrat">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-light tracking-[0.3em] text-slate-900 uppercase">
            MOVEUP<span className="text-blue-600">.</span>
          </Link>
          <div className="flex items-center gap-8">
            <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-slate-400">{user?.email}</span>
            <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 border-l border-slate-100 pl-8 hover:text-blue-600 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Welcome Section - Leaders Create Style */}
        <div className="mb-24">
          <span className="text-[10px] tracking-[0.4em] text-blue-600 uppercase font-black mb-6 block">Member Dashboard</span>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-slate-900 leading-none">
            Welcome back, <br />
            <span className="font-semibold">{user?.email?.split('@')[0]}</span>
          </h1>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
          {[
            { label: 'Active Programs', val: enrollments.length },
            { label: 'Completion Rate', val: `${enrollments.length > 0 ? Math.round((completedCourses / enrollments.length) * 100) : 0}%` },
            { label: 'Achievements', val: completedCourses }
          ].map((stat, i) => (
            <div key={i} className="border-t border-slate-100 pt-8">
              <span className="block text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-4">{stat.label}</span>
              <span className="text-4xl font-light text-slate-900">{stat.val}</span>
            </div>
          ))}
        </div>

        {/* My Programs - Flat UI Grid */}
        <div className="mb-12 flex justify-between items-end border-b border-slate-100 pb-8">
          <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-900">Current Programs</h2>
          <Link href="/courses" className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-slate-900 transition-colors">Browse Catalog —&gt;</Link>
        </div>

        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {enrollments.map((item) => {
              const progress = item.lesson_progress.length > 0 
                ? Math.round((item.lesson_progress.filter(p => p.completed).length / item.lesson_progress.length) * 100) 
                : 0
              return (
                <div key={item.id} className="group cursor-pointer">
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden mb-8">
                    <img 
                      src={item.courses.thumbnail_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'} 
                      alt=""
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] bg-blue-600 transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-2 group-hover:text-blue-600 transition-colors">{item.courses.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">{progress}% Completed</span>
                    <Link href={`/learn/${item.courses.id}`} className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-900 pb-1">Continue</Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-24 text-center border border-dashed border-slate-100">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-8">No active enrollments found</p>
            <Link href="/courses" className="px-10 py-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-600 transition-all">Start Your Journey</Link>
          </div>
        )}
      </main>
    </div>
  )
}
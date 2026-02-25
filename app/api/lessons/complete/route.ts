import { createClient } from '@/lib/supabase/server'
import { checkAndGenerateCertificates } from '@/lib/certificates'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { enrollmentId, lessonId } = body

    if (!enrollmentId || !lessonId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership of enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, user_id')
      .eq('id', enrollmentId)
      .single()

    if (enrollmentError || !enrollment || enrollment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    // Check if lesson progress exists
    const { data: existingProgress } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('enrollment_id', enrollmentId)
      .eq('lesson_id', lessonId)
      .single()

    let progressData

    if (existingProgress) {
      // Update existing progress
      const { data } = await supabase
        .from('lesson_progress')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id)
        .select()
        .single()

      progressData = data
    } else {
      // Create new progress
      const { data } = await supabase
        .from('lesson_progress')
        .insert([{
          enrollment_id: enrollmentId,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: new Date().toISOString(),
        }])
        .select()
        .single()

      progressData = data
    }

    // Check if all lessons are completed and generate certificate if needed
    const certificate = await checkAndGenerateCertificates(enrollmentId)

    return NextResponse.json({
      success: true,
      progress: progressData,
      certificate: certificate || null,
    })
  } catch (error: any) {
    console.error('Lesson complete error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

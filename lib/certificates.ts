'use server'

import { createClient } from '@/lib/supabase/server'

export async function generateCertificate(enrollmentId: string) {
  try {
    const supabase = await createClient()

    // Get enrollment data
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select(`
        id,
        status,
        completed_at,
        user_id,
        course_id,
        course:courses(
          id,
          title,
          duration_hours
        )
      `)
      .eq('id', enrollmentId)
      .single()

    if (enrollmentError || !enrollment) {
      throw new Error('Enrollment not found')
    }

    // Check if enrollment is completed
    if (enrollment.status !== 'completed' || !enrollment.completed_at) {
      throw new Error('Course not yet completed')
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from('certificates')
      .select('id')
      .eq('enrollment_id', enrollmentId)
      .single()

    if (existingCert) {
      return existingCert
    }

    // Generate certificate ID
    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create certificate record
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .insert([{
        enrollment_id: enrollmentId,
        certificate_url: `/certificates/${certificateId}.pdf`,
        issued_at: new Date().toISOString(),
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      }])
      .select()
      .single()

    if (certError) {
      throw new Error('Failed to create certificate')
    }

    return certificate
  } catch (error) {
    console.error('Certificate generation error:', error)
    throw error
  }
}

export async function checkAndGenerateCertificates(enrollmentId: string) {
  try {
    const supabase = await createClient()

    // Get enrollment with lesson progress
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select(`
        id,
        status,
        progress_percent,
        course_id,
        course:courses(total_lessons)
      `)
      .eq('id', enrollmentId)
      .single()

    if (!enrollment) {
      return null
    }

    // Get completed lessons count
    const { count: completedCount } = await supabase
      .from('lesson_progress')
      .select('id', { count: 'exact' })
      .eq('enrollment_id', enrollmentId)
      .eq('is_completed', true)

    const totalLessons = enrollment.course?.total_lessons || 1
    const progressPercent = Math.round((completedCount || 0) / totalLessons * 100)

    // Update enrollment progress
    if (progressPercent !== enrollment.progress_percent) {
      await supabase
        .from('enrollments')
        .update({ progress_percent: progressPercent })
        .eq('id', enrollmentId)
    }

    // If all lessons completed, mark enrollment as completed and generate certificate
    if (completedCount === totalLessons && enrollment.status !== 'completed') {
      await supabase
        .from('enrollments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          progress_percent: 100,
        })
        .eq('id', enrollmentId)

      // Generate certificate
      const certificate = await generateCertificate(enrollmentId)
      return certificate
    }

    return null
  } catch (error) {
    console.error('Error checking completion:', error)
    throw error
  }
}

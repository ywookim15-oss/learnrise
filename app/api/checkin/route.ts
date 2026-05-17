import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId, courseId } = await req.json()
    if (!userId || !courseId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const today = new Date().toISOString().split('T')[0]

    // Check if already checked in today
    const { data: existing } = await supabase
      .from('checkins')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('checked_in_at', today)
      .single()

    if (existing) {
      return NextResponse.json({ message: 'Already checked in today', alreadyDone: true })
    }

    const xpEarned = 10

    // Insert check-in
    await supabase.from('checkins').insert({
      user_id: userId,
      course_id: courseId,
      checked_in_at: today,
      xp_earned: xpEarned,
    })

    // Update streak and XP
    await supabase.rpc('update_streak_and_xp', {
      p_user_id: userId,
      p_xp_amount: xpEarned,
    })

    // Update course last_checkin and total_checkins
    await supabase.from('courses')
      .update({
        last_checkin: today,
        total_checkins: supabase.rpc('increment', { x: 1 }),
      })
      .eq('id', courseId)

    // Get updated profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak, xp, level')
      .eq('id', userId)
      .single()

    return NextResponse.json({ success: true, xpEarned, profile })
  } catch (error) {
    console.error('Checkin error:', error)
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 })
  }
}

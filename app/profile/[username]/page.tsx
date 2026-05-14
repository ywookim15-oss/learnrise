'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import styles from './profile.module.css'

type Week = { label: string; content: string; resources: string[] }
type Plan = { title: string; meta: string; overview: string; weeks: Week[]; milestone: string }
type Course = { id: string; title: string; meta: string; plan: Plan; created_at: string }
type Profile = { full_name: string; username: string; avatar_url: string; streak: number; xp: number; level: number; is_public: boolean }

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; id: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [showForm, setShowForm] = useState(false)
  const [topic, setTopic] = useState('')
  const [time, setTime] = useState('')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [activePlan, setActivePlan] = useState<Plan | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser({ email: session.user.email!, id: session.user.id })

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      if (prof) setProfile(prof)

      loadCourses(session.user.id)
    }
    init()
  }, [router])

  async function loadCourses(userId: string) {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setCourses(data)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function generatePlan() {
    if (!topic || !time || !goal) { setError('Please fill in all three fields.'); return }
    setError(''); setLoading(true); setActivePlan(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, time, goal }),
      })
      const plan = await res.json()
      if (!res.ok) throw new Error(plan.error || 'Generation failed')

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase.from('courses').insert({
          user_id: session.user.id,
          title: plan.title,
          meta: plan.meta,
          plan,
        }).select().single()
        if (data) setCourses(prev => [data, ...prev])
      }

      setActivePlan(plan)
      setShowForm(false)
      setTopic(''); setTime(''); setGoal('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : displayName.slice(0, 2).toUpperCase()

  if (!user) return <div className={styles.loading}>Loading...</div>

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerAvatar}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className={styles.headerAvatarImg} />
              ) : (
                <div className={styles.headerAvatarPlaceholder}>{initials}</div>
              )}
            </div>
            <div>
              <h1>Welcome back, {displayName} 👋</h1>
              <p>Ready to learn something new today?</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/profile/edit" className={styles.editProfileBtn}>Edit profile</Link>
            {profile?.username && (
              <Link href={`/profile/${profile.username}`} className={styles.viewProfileBtn}>View profile</Link>
            )}
            <button className={styles.signOutBtn} onClick={handleSignOut}>Sign out</button>
          </div>
        </div>

        <div className={styles.stats}>
          {[
            ['🔥 ' + (profile?.streak || 0), 'Day streak'],
            [String(profile?.xp || 0), 'Total XP'],
            ['Lv. ' + (profile?.level || 1), 'Level'],
            [String(courses.length), 'Courses'],
          ].map(([val, label]) => (
            <div key={label} className={styles.stat}>
              <div className={styles.statVal}>{val}</div>
              <div className={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        <p className={styles.sectionTitle}>Your courses</p>

        {courses.length === 0 && !showForm && !activePlan && (
          <div className={styles.empty}>No courses yet. Create your first one below!</div>
        )}

        {courses.map(course => (
          <div key={course.id} className={styles.courseCard} onClick={() => setActivePlan(course.plan)}>
            <div className={styles.courseIcon}>📚</div>
            <div className={styles.courseInfo}>
              <div className={styles.courseTitle}>{course.title}</div>
              <div className={styles.courseMeta}>{course.meta}</div>
              <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '5%' }} /></div>
            </div>
            <div className={styles.streak}>View →</div>
          </div>
        ))}

        {activePlan && (
          <div className={styles.planCard}>
            <div className={styles.planHeader}>
              <div className={styles.planIcon}>📚</div>
              <div>
                <div className={styles.planTitle}>{activePlan.title}</div>
                <div className={styles.planMeta}>{activePlan.meta}</div>
              </div>
              <button className={styles.closeBtn} onClick={() => setActivePlan(null)}>✕</button>
            </div>
            {activePlan.overview && <p className={styles.planOverview}>{activePlan.overview}</p>}
            {activePlan.weeks?.map((week, i) => (
              <div key={i} className={styles.weekBlock}>
                <div className={styles.weekLabel}>{week.label}</div>
                <p className={styles.weekContent}>{week.content}</p>
                {week.resources?.length > 0 && (
                  <div className={styles.resources}>
                    {week.resources.map((r, j) => <span key={j} className={styles.resourceTag}>🔗 {r}</span>)}
                  </div>
                )}
              </div>
            ))}
            {activePlan.milestone && (
              <div className={styles.milestone}>
                <div className={styles.milestoneLabel}>Your milestone</div>
                <p>{activePlan.milestone}</p>
              </div>
            )}
          </div>
        )}

        {showForm ? (
          <div className={styles.formCard}>
            <div className={styles.formTitle}>New learning plan</div>
            <label className={styles.fieldLabel}>What do you want to learn?</label>
            <textarea className={styles.textarea} rows={3} placeholder="e.g. I want to learn Python for data analysis..." value={topic} onChange={e => setTopic(e.target.value)} />
            <label className={styles.fieldLabel}>Your time &amp; schedule</label>
            <textarea className={styles.textarea} rows={2} placeholder="e.g. I have 8 weeks, 1 hour each weekday evening..." value={time} onChange={e => setTime(e.target.value)} />
            <label className={styles.fieldLabel}>Your goal &amp; motivation</label>
            <textarea className={styles.textarea} rows={2} placeholder="e.g. I want to get a data analyst job in 6 months..." value={goal} onChange={e => setGoal(e.target.value)} />
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.formBtns}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.generateBtn} onClick={generatePlan} disabled={loading}>
                {loading ? 'Generating plan...' : '✦ Generate my plan'}
              </button>
            </div>
          </div>
        ) : (
          <button className={styles.newBtn} onClick={() => setShowForm(true)}>+ New learning plan</button>
        )}
      </main>
    </>
  )
}

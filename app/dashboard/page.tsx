'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import styles from './dashboard.module.css'

type Resource = { name: string; type: string; url: string; why: string }
type Project = { title: string; description: string; outcome: string }
type Week = {
  label: string; theme: string; difficulty: string; estimated_hours: number
  introduction: string; key_concepts: string[]; content: string
  daily_tasks: string[]; project: Project; resources: Resource[]
  common_mistakes: string[]; motivation: string; checkpoint: string
}
type Plan = {
  title: string; meta: string; overview: string; prerequisites: string[]
  weeks: Week[]; milestone: string; next_steps: string[]
}
type Course = { id: string; title: string; meta: string; plan: Plan; created_at: string }
type Profile = { full_name: string; username: string; avatar_url: string; streak: number; xp: number; level: number }

const resourceTypeIcon: Record<string, string> = {
  video_course: '🎬', article: '📄', book: '📖',
  tool: '🛠️', documentation: '📋', podcast: '🎙️', project: '💡',
}

const resourceTypeLabel: Record<string, string> = {
  video_course: 'Video Course', article: 'Article', book: 'Book',
  tool: 'Tool', documentation: 'Docs', podcast: 'Podcast', project: 'Project',
}

const difficultyColor: Record<string, string> = {
  Beginner: '#16A34A', Intermediate: '#D97706', Advanced: '#DC2626',
}

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
  const [activeWeek, setActiveWeek] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser({ email: session.user.email!, id: session.user.id })
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (prof) setProfile(prof)
      loadCourses(session.user.id)
    }
    init()
  }, [router])

  async function loadCourses(userId: string) {
    const { data } = await supabase.from('courses').select('*').eq('user_id', userId).order('created_at', { ascending: false })
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
          user_id: session.user.id, title: plan.title, meta: plan.meta, plan,
        }).select().single()
        if (data) setCourses(prev => [data, ...prev])
      }
      setActivePlan(plan)
      setActiveWeek(0)
      setShowForm(false)
      setTopic(''); setTime(''); setGoal('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function openCourse(course: Course) {
    setActivePlan(course.plan)
    setActiveWeek(0)
    setShowForm(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt={displayName} className={styles.headerAvatarImg} />
                : <div className={styles.headerAvatarPlaceholder}>{initials}</div>}
            </div>
            <div>
              <h1>Welcome back, {displayName} 👋</h1>
              <p>Ready to learn something new today?</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/profile/edit" className={styles.editProfileBtn}>Edit profile</Link>
            {profile?.username && <Link href={`/profile/${profile.username}`} className={styles.viewProfileBtn}>View profile</Link>}
            <button className={styles.signOutBtn} onClick={handleSignOut}>Sign out</button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          {[['🔥 ' + (profile?.streak || 0), 'Day streak'], [String(profile?.xp || 0), 'Total XP'], ['Lv. ' + (profile?.level || 1), 'Level'], [String(courses.length), 'Courses']].map(([val, label]) => (
            <div key={label} className={styles.stat}>
              <div className={styles.statVal}>{val}</div>
              <div className={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* Active Plan View */}
        {activePlan && (
          <div className={styles.planView}>

            {/* Plan header */}
            <div className={styles.planViewHeader}>
              <div>
                <h2 className={styles.planViewTitle}>{activePlan.title}</h2>
                <p className={styles.planViewMeta}>{activePlan.meta}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setActivePlan(null)}>✕ Close</button>
            </div>

            <p className={styles.planOverview}>{activePlan.overview}</p>

            {/* Prerequisites */}
            {activePlan.prerequisites?.length > 0 && (
              <div className={styles.prereqBox}>
                <div className={styles.prereqTitle}>📌 Before you start</div>
                <div className={styles.prereqList}>
                  {activePlan.prerequisites.map((p, i) => <span key={i} className={styles.prereqTag}>{p}</span>)}
                </div>
              </div>
            )}

            {/* Week tabs */}
            <div className={styles.weekTabs}>
              {activePlan.weeks?.map((week, i) => (
                <button key={i} className={`${styles.weekTab} ${activeWeek === i ? styles.weekTabActive : ''}`} onClick={() => setActiveWeek(i)}>
                  Week {i + 1}
                </button>
              ))}
            </div>

            {/* Week content */}
            {activePlan.weeks?.[activeWeek] && (() => {
              const week = activePlan.weeks[activeWeek]
              return (
                <div className={styles.weekContent}>

                  {/* Week header */}
                  <div className={styles.weekHeader}>
                    <div>
                      <div className={styles.weekLabel}>{week.label}</div>
                      <div className={styles.weekTheme}>{week.theme}</div>
                    </div>
                    <div className={styles.weekMeta}>
                      <span className={styles.difficultyBadge} style={{ color: difficultyColor[week.difficulty] || '#6B7280', background: (difficultyColor[week.difficulty] || '#6B7280') + '18' }}>
                        {week.difficulty}
                      </span>
                      <span className={styles.hoursBadge}>⏱ {week.estimated_hours}h</span>
                    </div>
                  </div>

                  {/* Introduction */}
                  {week.introduction && (
                    <div className={styles.introBox}>
                      <p>{week.introduction}</p>
                    </div>
                  )}

                  {/* Key concepts */}
                  {week.key_concepts?.length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.sectionTitle}>🧠 Key concepts</div>
                      <div className={styles.conceptsList}>
                        {week.key_concepts.map((concept, i) => {
                          const [name, ...rest] = concept.split(':')
                          return (
                            <div key={i} className={styles.conceptItem}>
                              <span className={styles.conceptName}>{name.trim()}</span>
                              {rest.length > 0 && <span className={styles.conceptDesc}>{rest.join(':').trim()}</span>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <p className={styles.weekDesc}>{week.content}</p>

                  {/* Daily tasks */}
                  {week.daily_tasks?.length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.sectionTitle}>📅 Daily plan</div>
                      <div className={styles.dailyTasks}>
                        {week.daily_tasks.map((task, i) => (
                          <div key={i} className={styles.dailyTask}>
                            <div className={styles.dayDot} />
                            <p>{task}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project */}
                  {week.project?.title && (
                    <div className={styles.section}>
                      <div className={styles.sectionTitle}>💻 This week&apos;s project</div>
                      <div className={styles.projectCard}>
                        <div className={styles.projectTitle}>{week.project.title}</div>
                        <p className={styles.projectDesc}>{week.project.description}</p>
                        <div className={styles.projectOutcome}>
                          <span className={styles.projectOutcomeLabel}>What you&apos;ll have:</span> {week.project.outcome}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {week.resources?.length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.sectionTitle}>📚 Resources</div>
                      <div className={styles.resources}>
                        {week.resources.map((r, i) => (
                          <a
                            key={i}
                            href={r.url?.startsWith('http') ? r.url : `https://${r.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.resourceCard}
                          >
                            <div className={styles.resourceIconWrap}>
                              <span className={styles.resourceIcon}>{resourceTypeIcon[r.type] || '🔗'}</span>
                            </div>
                            <div className={styles.resourceInfo}>
                              <div className={styles.resourceTop}>
                                <span className={styles.resourceName}>{r.name}</span>
                                <span className={styles.resourceTypeBadge}>{resourceTypeLabel[r.type] || r.type}</span>
                              </div>
                              <div className={styles.resourceWhy}>{r.why}</div>
                              <div className={styles.resourceUrl}>{r.url}</div>
                            </div>
                            <div className={styles.resourceArrow}>↗</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common mistakes */}
                  {week.common_mistakes?.length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.sectionTitle}>⚠️ Common mistakes to avoid</div>
                      <div className={styles.mistakesList}>
                        {week.common_mistakes.map((m, i) => (
                          <div key={i} className={styles.mistakeItem}>
                            <span className={styles.mistakeIcon}>✕</span>
                            <p>{m}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Motivation */}
                  {week.motivation && (
                    <div className={styles.motivationBox}>
                      <span className={styles.motivationIcon}>💪</span>
                      <p>{week.motivation}</p>
                    </div>
                  )}

                  {/* Checkpoint */}
                  {week.checkpoint && (
                    <div className={styles.checkpoint}>
                      <div className={styles.checkpointTitle}>✅ Week checkpoint</div>
                      <p>{week.checkpoint}</p>
                    </div>
                  )}

                  {/* Week nav */}
                  <div className={styles.weekNav}>
                    <button className={styles.weekNavBtn} onClick={() => setActiveWeek(w => Math.max(0, w - 1))} disabled={activeWeek === 0}>← Previous week</button>
                    <button className={styles.weekNavBtn} onClick={() => setActiveWeek(w => Math.min(activePlan.weeks.length - 1, w + 1))} disabled={activeWeek === activePlan.weeks.length - 1}>Next week →</button>
                  </div>
                </div>
              )
            })()}

            {/* Milestone */}
            {activePlan.milestone && (
              <div className={styles.milestone}>
                <div className={styles.milestoneLabel}>🏆 Final milestone</div>
                <p>{activePlan.milestone}</p>
              </div>
            )}

            {/* Next steps */}
            {activePlan.next_steps?.length > 0 && (
              <div className={styles.nextSteps}>
                <div className={styles.nextStepsTitle}>🚀 What&apos;s next after this plan</div>
                {activePlan.next_steps.map((s, i) => (
                  <div key={i} className={styles.nextStep}>→ {s}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Course list */}
        {!activePlan && (
          <>
            <p className={styles.sectionTitleMain}>Your courses</p>
            {courses.length === 0 && !showForm && (
              <div className={styles.empty}>No courses yet. Create your first one below!</div>
            )}
            {courses.map(course => (
              <div key={course.id} className={styles.courseCard} onClick={() => openCourse(course)}>
                <div className={styles.courseIcon}>📚</div>
                <div className={styles.courseInfo}>
                  <div className={styles.courseTitle}>{course.title}</div>
                  <div className={styles.courseMeta}>{course.meta}</div>
                  <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '5%' }} /></div>
                </div>
                <div className={styles.courseArrow}>View →</div>
              </div>
            ))}
          </>
        )}

        {/* New plan form */}
        {showForm ? (
          <div className={styles.formCard}>
            <div className={styles.formTitle}>New learning plan</div>
            <label className={styles.fieldLabel}>What do you want to learn?</label>
            <textarea className={styles.textarea} rows={3} placeholder="e.g. I want to learn Python for data analysis, focusing on pandas and building dashboards..." value={topic} onChange={e => setTopic(e.target.value)} />
            <label className={styles.fieldLabel}>Your time &amp; schedule</label>
            <textarea className={styles.textarea} rows={2} placeholder="e.g. I have 8 weeks, 1 hour each weekday evening and 3 hours on weekends..." value={time} onChange={e => setTime(e.target.value)} />
            <label className={styles.fieldLabel}>Your goal &amp; motivation</label>
            <textarea className={styles.textarea} rows={2} placeholder="e.g. I want to transition into a data analyst role within 6 months..." value={goal} onChange={e => setGoal(e.target.value)} />
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.formBtns}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.generateBtn} onClick={generatePlan} disabled={loading}>
                {loading ? 'Building your plan...' : '✦ Generate my plan'}
              </button>
            </div>
          </div>
        ) : (
          <button className={styles.newBtn} onClick={() => { setActivePlan(null); setShowForm(true) }}>
            + New learning plan
          </button>
        )}
      </main>
    </>
  )
}

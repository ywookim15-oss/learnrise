'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import styles from './dashboard.module.css'

type Resource = { name: string; type: string; url: string; why: string }
type Project = { title: string; description: string; outcome: string }
type CheckpointObj = { question: string; criteria: string[] }
type Week = {
  label: string; theme: string; difficulty: string; estimated_hours: number
  introduction: string; key_concepts: string[]; content: string
  daily_tasks: string[]; project: Project; resources: Resource[]
  common_mistakes: string[]; motivation: string; checkpoint: string | CheckpointObj
}
type Plan = {
  title: string; meta: string; overview: string; prerequisites: string[]
  weeks: Week[]; milestone: string; next_steps: string[]
}
type Course = { id: string; title: string; meta: string; plan: Plan; created_at: string; last_checkin: string | null; total_checkins: number; skill_level: string }
type Profile = { full_name: string; username: string; avatar_url: string; streak: number; xp: number; level: number; onboarded: boolean }

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
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function Dashboard() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [showForm, setShowForm] = useState(false)
  const [topic, setTopic] = useState('')
  const [time, setTime] = useState('')
  const [goal, setGoal] = useState('')
  const [skillLevel, setSkillLevel] = useState('Beginner')
  const [loading, setLoading] = useState(false)
  const [activeCourse, setActiveCourse] = useState<Course | null>(null)
  const [activePlan, setActivePlan] = useState<Plan | null>(null)
  const [activeWeek, setActiveWeek] = useState(0)
  const [error, setError] = useState('')
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [checkinDone, setCheckinDone] = useState(false)
  const [xpPopup, setXpPopup] = useState('')
  const [showRegenForm, setShowRegenForm] = useState(false)
  const [regenNote, setRegenNote] = useState('')
  const [regenLoading, setRegenLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)
      setUserEmail(session.user.email || '')
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (prof) {
        setProfile(prof)
        if (!prof.onboarded) { router.push('/onboarding'); return }
      }
      loadCourses(session.user.id)
    }
    init()
  }, [router])

  async function loadCourses(uid: string) {
    const { data } = await supabase.from('courses').select('*').eq('user_id', uid).order('created_at', { ascending: false })
    if (data) setCourses(data)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleDeleteCourse(courseId: string) {
    await supabase.from('courses').delete().eq('id', courseId)
    setCourses(prev => prev.filter(c => c.id !== courseId))
    if (activeCourse?.id === courseId) { setActiveCourse(null); setActivePlan(null) }
    setDeleteConfirm(null)
  }

  async function generatePlan() {
    if (!topic || !time || !goal) { setError('Please fill in all three fields.'); return }
    setError(''); setLoading(true); setActivePlan(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, time, goal, skillLevel }),
      })
      const plan = await res.json()
      if (!res.ok) throw new Error(plan.error || 'Generation failed')
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: newCourse } = await supabase.from('courses').insert({
          user_id: session.user.id, title: plan.title, meta: plan.meta, plan, skill_level: skillLevel,
        }).select().single()
        if (newCourse) {
          setCourses(prev => [newCourse, ...prev])
          setActiveCourse(newCourse)
          if (profile) {
            await supabase.from('activity_feed').insert({
              user_id: session.user.id, username: profile.username,
              full_name: profile.full_name, avatar_url: profile.avatar_url,
              action: 'created_course', course_title: plan.title,
              detail: `${skillLevel} level · ${plan.meta}`,
            })
          }
        }
      }
      setActivePlan(plan); setActiveWeek(0); setShowForm(false)
      setTopic(''); setTime(''); setGoal('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally { setLoading(false) }
  }

  async function handleCheckin() {
    if (!userId || !activeCourse) return
    setCheckinLoading(true)
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId: activeCourse.id }),
      })
      const data = await res.json()
      if (data.alreadyDone) { setCheckinDone(true); setXpPopup('Already checked in today! ✓') }
      else if (data.success) {
        setCheckinDone(true); setXpPopup(`+${data.xpEarned} XP! 🔥`)
        if (data.profile) setProfile(p => p ? { ...p, ...data.profile } : p)
      }
      setTimeout(() => setXpPopup(''), 2500)
    } catch (e) { console.error(e) }
    finally { setCheckinLoading(false) }
  }

  async function handleRegenerate() {
    if (!regenNote || !activeCourse) return
    setRegenLoading(true)
    try {
      const original = activeCourse.plan
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: original.title, time: original.meta, goal: original.overview,
          skillLevel: activeCourse.skill_level, regenerateWith: regenNote,
        }),
      })
      const plan = await res.json()
      if (!res.ok) throw new Error(plan.error)
      await supabase.from('courses').update({ plan }).eq('id', activeCourse.id)
      setCourses(prev => prev.map(c => c.id === activeCourse.id ? { ...c, plan } : c))
      setActivePlan(plan); setActiveCourse(prev => prev ? { ...prev, plan } : prev)
      setShowRegenForm(false); setRegenNote(''); setActiveWeek(0)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Regeneration failed.')
    } finally { setRegenLoading(false) }
  }

  function openCourse(course: Course) {
    setActiveCourse(course); setActivePlan(course.plan)
    setActiveWeek(0); setShowForm(false); setCheckinDone(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function renderCheckpoint(checkpoint: string | CheckpointObj) {
    if (typeof checkpoint === 'string') {
      return <p className={styles.checkpointText}>{checkpoint}</p>
    }
    return (
      <>
        {checkpoint.question && <p className={styles.checkpointText}>{checkpoint.question}</p>}
        {checkpoint.criteria?.map((c: string, i: number) => (
          <p key={i} className={styles.checkpointCriterion}>• {c}</p>
        ))}
      </>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const alreadyCheckedIn = activeCourse?.last_checkin === today
  const displayName = profile?.full_name?.split(' ')[0] || 'there'
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : displayName.slice(0, 2).toUpperCase()

  if (!userId) return <div className={styles.loading}>Loading...</div>

  return (
    <>
      <Navbar />
      <main className={styles.main}>

        {xpPopup && <div className={styles.xpPopup}>{xpPopup}</div>}

        {deleteConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalIcon}>🗑️</div>
              <h3 className={styles.modalTitle}>Delete this course?</h3>
              <p className={styles.modalDesc}>This can&apos;t be undone. All progress will be lost.</p>
              <div className={styles.modalBtns}>
                <button className={styles.modalCancel} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className={styles.modalDelete} onClick={() => handleDeleteCourse(deleteConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}

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
            <Link href="/social" className={styles.socialBtn}>🌍 Community</Link>
            <Link href="/profile/edit" className={styles.editProfileBtn}>Edit profile</Link>
            {profile?.username && <Link href={`/profile/${profile.username}`} className={styles.viewProfileBtn}>View profile</Link>}
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

        {activePlan && activeCourse && (
          <div className={styles.planView}>
            <div className={styles.planViewHeader}>
              <div>
                <h2 className={styles.planViewTitle}>{activePlan.title}</h2>
                <p className={styles.planViewMeta}>{activePlan.meta} · {activeCourse.skill_level}</p>
              </div>
              <div className={styles.planHeaderActions}>
                <button className={styles.regenBtn} onClick={() => setShowRegenForm(s => !s)}>↺ Adjust</button>
                <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(activeCourse.id)}>🗑️</button>
                <button className={styles.closeBtn} onClick={() => { setActivePlan(null); setActiveCourse(null) }}>✕</button>
              </div>
            </div>

            {showRegenForm && (
              <div className={styles.regenForm}>
                <p className={styles.regenLabel}>How would you like to adjust this plan?</p>
                <div className={styles.regenSuggestions}>
                  {['Make it harder', 'Make it easier', 'Focus more on projects', 'I have less time', 'Add more resources'].map(s => (
                    <button key={s} className={styles.regenSuggestion} onClick={() => setRegenNote(s)}>{s}</button>
                  ))}
                </div>
                <textarea className={styles.regenTextarea} rows={2} placeholder="Or describe your own adjustment..." value={regenNote} onChange={e => setRegenNote(e.target.value)} />
                <div className={styles.regenBtns}>
                  <button className={styles.cancelBtn} onClick={() => setShowRegenForm(false)}>Cancel</button>
                  <button className={styles.generateBtn} onClick={handleRegenerate} disabled={regenLoading || !regenNote}>
                    {regenLoading ? 'Regenerating...' : '↺ Regenerate'}
                  </button>
                </div>
              </div>
            )}

            <p className={styles.planOverview}>{activePlan.overview}</p>

            <div className={styles.checkinBox}>
              <div className={styles.checkinLeft}>
                <div className={styles.checkinTitle}>Daily check-in</div>
                <div className={styles.checkinDesc}>
                  {alreadyCheckedIn || checkinDone
                    ? "You've checked in today! Come back tomorrow."
                    : "Mark today as done to earn XP and keep your streak."}
                </div>
              </div>
              <button
                className={`${styles.checkinBtn} ${(alreadyCheckedIn || checkinDone) ? styles.checkinBtnDone : ''}`}
                onClick={handleCheckin}
                disabled={checkinLoading || alreadyCheckedIn || checkinDone}
              >
                {checkinLoading ? '...' : (alreadyCheckedIn || checkinDone) ? '✓ Done' : '+ Check in · +10 XP'}
              </button>
            </div>

            {activePlan.prerequisites?.length > 0 && (
              <div className={styles.prereqBox}>
                <div className={styles.prereqTitle}>📌 Before you start</div>
                <div className={styles.prereqList}>
                  {activePlan.prerequisites.map((p, i) => <span key={i} className={styles.prereqTag}>{p}</span>)}
                </div>
              </div>
            )}

            <div className={styles.weekTabs}>
              {activePlan.weeks?.map((_, i) => (
                <button key={i} className={`${styles.weekTab} ${activeWeek === i ? styles.weekTabActive : ''}`} onClick={() => setActiveWeek(i)}>
                  Week {i + 1}
                </button>
              ))}
            </div>

            {activePlan.weeks?.[activeWeek] && (() => {
              const week = activePlan.weeks[activeWeek]
              return (
                <div className={styles.weekContent}>
                  <div className={styles.weekHeader}>
                    <div>
                      <div className={styles.weekLabel}>{week.label || `Week ${activeWeek + 1}`}</div>
                      <div className={styles.weekTheme}>{week.theme}</div>
                    </div>
                    <div className={styles.weekMeta}>
                      <span className={styles.difficultyBadge} style={{ color: difficultyColor[week.difficulty] || '#6B7280', background: (difficultyColor[week.difficulty] || '#6B7280') + '18' }}>
                        {week.difficulty}
                      </span>
                      <span className={styles.hoursBadge}>⏱ {week.estimated_hours}h</span>
                    </div>
                  </div>

                  {week.introduction && <div className={styles.introBox}><p>{week.introduction}</p></div>}

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

                  {week.content && <p className={styles.weekDesc}>{week.content}</p>}

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

                  {week.resources?.length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.sectionTitle}>📚 Resources</div>
                      <div className={styles.resources}>
                        {week.resources.map((r, i) => (
                          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className={styles.resourceCard}>
                            <div className={styles.resourceIconWrap}>
                              <span className={styles.resourceIcon}>{resourceTypeIcon[r.type] || '🔗'}</span>
                            </div>
                            <div className={styles.resourceInfo}>
                              <div className={styles.resourceTop}>
                                <span className={styles.resourceName}>{r.name}</span>
                                <span className={styles.resourceTypeBadge}>{resourceTypeLabel[r.type] || r.type}</span>
                              </div>
                              <div className={styles.resourceWhy}>{r.why}</div>
                              <div className={styles.resourceUrl}>Click to find this resource →</div>
                            </div>
                            <div className={styles.resourceArrow}>↗</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

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

                  {week.motivation && (
                    <div className={styles.motivationBox}>
                      <span className={styles.motivationIcon}>💪</span>
                      <p>{week.motivation}</p>
                    </div>
                  )}

                  {week.checkpoint && (
                    <div className={styles.checkpoint}>
                      <div className={styles.checkpointTitle}>✅ Week checkpoint</div>
                      {renderCheckpoint(week.checkpoint)}
                    </div>
                  )}

                  <div className={styles.weekNav}>
                    <button className={styles.weekNavBtn} onClick={() => setActiveWeek(w => Math.max(0, w - 1))} disabled={activeWeek === 0}>← Previous</button>
                    <button className={styles.weekNavBtn} onClick={() => setActiveWeek(w => Math.min(activePlan.weeks.length - 1, w + 1))} disabled={activeWeek === activePlan.weeks.length - 1}>Next →</button>
                  </div>
                </div>
              )
            })()}

            {activePlan.milestone && (
              <div className={styles.milestone}>
                <div className={styles.milestoneLabel}>🏆 Final milestone</div>
                <p>{activePlan.milestone}</p>
              </div>
            )}

            {activePlan.next_steps?.length > 0 && (
              <div className={styles.nextSteps}>
                <div className={styles.nextStepsTitle}>🚀 What&apos;s next after this plan</div>
                {activePlan.next_steps.map((s, i) => <div key={i} className={styles.nextStep}>→ {s}</div>)}
              </div>
            )}
          </div>
        )}

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
                  <div className={styles.courseMeta}>{course.meta} · {course.skill_level}</div>
                  <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${Math.min((course.total_checkins || 0) * 5, 100)}%` }} /></div>
                </div>
                <div className={styles.courseRight}>
                  {course.last_checkin === today && <span className={styles.checkedBadge}>✓ Today</span>}
                  <button className={styles.courseDeleteBtn} onClick={e => { e.stopPropagation(); setDeleteConfirm(course.id) }}>🗑️</button>
                  <span className={styles.courseArrow}>View →</span>
                </div>
              </div>
            ))}
          </>
        )}

        {showForm ? (
          <div className={styles.formCard}>
            <div className={styles.formTitle}>New learning plan</div>
            <div className={styles.skillSelector}>
              <label className={styles.fieldLabel}>Your skill level</label>
              <div className={styles.skillBtns}>
                {SKILL_LEVELS.map(level => (
                  <button key={level} className={`${styles.skillBtn} ${skillLevel === level ? styles.skillBtnActive : ''}`} onClick={() => setSkillLevel(level)}>
                    {level === 'Beginner' ? '🌱' : level === 'Intermediate' ? '🌿' : '🌳'} {level}
                  </button>
                ))}
              </div>
            </div>
            <label className={styles.fieldLabel}>What do you want to learn?</label>
            <textarea className={styles.textarea} rows={3} placeholder="e.g. I want to learn Python for data analysis..." value={topic} onChange={e => setTopic(e.target.value)} />
            <label className={styles.fieldLabel}>Your time &amp; schedule</label>
            <textarea className={styles.textarea} rows={2} placeholder="e.g. I have 8 weeks, 1 hour each weekday evening..." value={time} onChange={e => setTime(e.target.value)} />
            <label className={styles.fieldLabel}>Your goal &amp; motivation</label>
            <textarea className={styles.textarea} rows={2} placeholder="e.g. I want to transition into a data analyst role..." value={goal} onChange={e => setGoal(e.target.value)} />
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.formBtns}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.generateBtn} onClick={generatePlan} disabled={loading}>
                {loading ? 'Building your plan...' : '✦ Generate my plan'}
              </button>
            </div>
          </div>
        ) : (
          <button className={styles.newBtn} onClick={() => { setActivePlan(null); setActiveCourse(null); setShowForm(true) }}>
            + New learning plan
          </button>
        )}
      </main>
    </>
  )
}

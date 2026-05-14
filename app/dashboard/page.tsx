'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import styles from './dashboard.module.css'

type Week = { label: string; content: string; resources: string[] }
type Plan = { title: string; meta: string; overview: string; weeks: Week[]; milestone: string }

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false)
  const [topic, setTopic] = useState('')
  const [time, setTime] = useState('')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [error, setError] = useState('')

  async function generatePlan() {
    if (!topic || !time || !goal) { setError('Please fill in all three fields.'); return }
    setError(''); setLoading(true); setPlan(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, time, goal }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setPlan(data)
      setShowForm(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Welcome back</h1>
          <p>You&apos;re on a 5-day streak. Keep it up!</p>
        </div>

        <div className={styles.stats}>
          {[['5', 'Day streak'], ['340', 'Total XP'], ['Lv. 4', 'Level'], ['1', 'Active courses']].map(([val, label]) => (
            <div key={label} className={styles.stat}>
              <div className={styles.statVal}>{val}</div>
              <div className={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        <p className={styles.sectionTitle}>Your courses</p>

        {!showForm && !plan && (
          <div className={styles.courseCard}>
            <div className={styles.courseIcon}>💻</div>
            <div className={styles.courseInfo}>
              <div className={styles.courseTitle}>Python for Data Analysis</div>
              <div className={styles.courseMeta}>Week 3 of 8 · 1 hr/day</div>
              <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '35%' }} /></div>
            </div>
            <div className={styles.streak}>🔥 5d</div>
          </div>
        )}

        {plan && (
          <div className={styles.planCard}>
            <div className={styles.planHeader}>
              <div className={styles.planIcon}>📚</div>
              <div>
                <div className={styles.planTitle}>{plan.title}</div>
                <div className={styles.planMeta}>{plan.meta}</div>
              </div>
            </div>
            {plan.overview && <p className={styles.planOverview}>{plan.overview}</p>}
            {plan.weeks?.map((week, i) => (
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
            {plan.milestone && (
              <div className={styles.milestone}>
                <div className={styles.milestoneLabel}>Your milestone</div>
                <p>{plan.milestone}</p>
              </div>
            )}
          </div>
        )}

        {showForm ? (
          <div className={styles.formCard}>
            <div className={styles.formTitle}>New learning plan</div>

            <label className={styles.fieldLabel}>What do you want to learn?</label>
            <textarea className={styles.textarea} rows={3} placeholder="e.g. I want to learn Python for data analysis, focusing on pandas, matplotlib, and building dashboards..." value={topic} onChange={e => setTopic(e.target.value)} />

            <label className={styles.fieldLabel}>Your time &amp; schedule</label>
            <textarea className={styles.textarea} rows={2} placeholder="e.g. I have 8 weeks, 1 hour each weekday evening and 3 hours on weekends..." value={time} onChange={e => setTime(e.target.value)} />

            <label className={styles.fieldLabel}>Your goal &amp; motivation</label>
            <textarea className={styles.textarea} rows={2} placeholder="e.g. I want to transition into a data analyst role within 6 months..." value={goal} onChange={e => setGoal(e.target.value)} />

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.formBtns}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.generateBtn} onClick={generatePlan} disabled={loading}>
                {loading ? 'Generating plan...' : '✦ Generate my plan'}
              </button>
            </div>
          </div>
        ) : (
          <button className={styles.newBtn} onClick={() => setShowForm(true)}>
            + New learning plan
          </button>
        )}
      </main>
    </>
  )
}

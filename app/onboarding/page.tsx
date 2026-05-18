'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './onboarding.module.css'

const STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to LearnRise',
    desc: 'You\'re about to learn anything you want — faster than ever. LearnRise builds you a real structured course in seconds, powered by AI.',
  },
  {
    emoji: '🎯',
    title: 'Tell us your goal',
    desc: 'You\'ll fill in 3 simple prompts: what you want to learn, how much time you have, and why you want to learn it. That\'s all we need.',
  },
  {
    emoji: '🤖',
    title: 'AI finds everything for you',
    desc: 'No more searching scattered resources. Our AI builds a week-by-week plan with real resources, daily tasks, projects, and checkpoints.',
  },
  {
    emoji: '🔥',
    title: 'Build your streak',
    desc: 'Check in every day to earn XP, level up, and keep your streak alive. See how you stack up on the leaderboard.',
  },
]

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const n = session.user.user_metadata?.full_name || ''
      setName(n.split(' ')[0] || 'there')
    }
    init()
  }, [router])

  async function handleFinish() {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('profiles').update({ onboarded: true }).eq('id', session.user.id)
    }
    router.push('/dashboard')
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.logo}>LearnRise</div>

        <div className={styles.progress}>
          {STEPS.map((_, i) => (
            <div key={i} className={`${styles.dot} ${i <= step ? styles.dotActive : ''}`} />
          ))}
        </div>

        <div className={styles.emoji}>{current.emoji}</div>
        <h1 className={styles.title}>
          {step === 0 ? `Welcome, ${name}!` : current.title}
        </h1>
        <p className={styles.desc}>{current.desc}</p>

        <div className={styles.actions}>
          {step > 0 && (
            <button className={styles.backBtn} onClick={() => setStep(s => s - 1)}>
              ← Back
            </button>
          )}
          <button
            className={styles.nextBtn}
            onClick={isLast ? handleFinish : () => setStep(s => s + 1)}
            disabled={saving}
          >
            {saving ? 'Setting up...' : isLast ? 'Create my first course →' : 'Next →'}
          </button>
        </div>

        <p className={styles.skip} onClick={handleFinish}>Skip intro</p>
      </div>
    </main>
  )
}

'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import styles from './pricing.module.css'

export default function Pricing() {
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsLoggedIn(true)
        setUserId(session.user.id)
        setEmail(session.user.email || '')
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', session.user.id)
          .single()
        if (profile?.subscription_status === 'active') setIsPremium(true)
      }
      setChecking(false)
    }
    init()
  }, [])

  async function handleUpgrade() {
    if (!isLoggedIn) { window.location.href = '/signup'; return }
    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleManage() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (e) {
      console.error(e)
    } finally {
      setPortalLoading(false)
    }
  }

  if (checking) return null

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <p className={styles.label}>Pricing</p>
          <h1>Simple, honest pricing</h1>
          <p>Start free. Upgrade when you&apos;re ready to go unlimited.</p>
        </div>

        <div className={styles.grid}>

          {/* Free plan */}
          <div className={styles.planCard}>
            <div className={styles.planName}>Free</div>
            <div className={styles.planPrice}>$0 <span>/ forever</span></div>
            <div className={styles.planDesc}>Perfect for trying LearnRise with your first goal.</div>
            <div className={styles.divider} />
            <ul className={styles.planFeatures}>
              <li>✓ 1 AI-generated course</li>
              <li>✓ Streaks &amp; XP tracking</li>
              <li>✓ Public learning profile</li>
              <li>✓ Community &amp; leaderboard</li>
            </ul>

            {/* Free plan button states */}
            {!isLoggedIn ? (
              <Link href="/signup" className={styles.btnFree}>Get started free</Link>
            ) : !isPremium ? (
              <div className={styles.currentPlanBadge}>✓ Your current plan</div>
            ) : (
              <button className={styles.btnManage} onClick={handleManage} disabled={portalLoading}>
                {portalLoading ? 'Loading...' : 'Switch to Free'}
              </button>
            )}
          </div>

          {/* Premium plan */}
          <div className={`${styles.planCard} ${styles.featured}`}>
            <div className={styles.badge}>Most popular</div>
            <div className={styles.planName}>Premium</div>
            <div className={styles.planPrice}>$20 <span>/ month</span></div>
            <div className={styles.planDesc}>For serious learners who want unlimited access.</div>
            <div className={styles.divider} />
            <ul className={styles.planFeatures}>
              <li>✓ Unlimited AI courses</li>
              <li>✓ Everything in Free</li>
              <li>✓ Skill-level tailored plans</li>
              <li>✓ Course regeneration</li>
              <li>✓ Streak protection</li>
              <li>✓ Progress export</li>
              <li>✓ Early access to features</li>
            </ul>

            {/* Premium plan button states */}
            {!isLoggedIn ? (
              <Link href="/signup" className={styles.btnPro}>Get started free</Link>
            ) : isPremium ? (
              <div className={styles.premiumActions}>
                <div className={styles.activeBadge}>✓ You&apos;re on Premium</div>
                <button className={styles.btnManage} onClick={handleManage} disabled={portalLoading}>
                  {portalLoading ? 'Loading...' : 'Manage subscription'}
                </button>
              </div>
            ) : (
              <button className={styles.btnPro} onClick={handleUpgrade} disabled={loading}>
                {loading ? 'Redirecting to checkout...' : 'Upgrade to Premium'}
              </button>
            )}
          </div>
        </div>

        <p className={styles.note}>
          {isLoggedIn
            ? 'Payments are secured by Stripe. Cancel anytime from your billing portal.'
            : 'No credit card required for the free plan. Cancel Premium anytime. Payments secured by Stripe.'}
        </p>
      </main>
    </>
  )
}

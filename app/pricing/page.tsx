import Link from 'next/link'
import Navbar from '@/components/Navbar'
import styles from './pricing.module.css'

export default function Pricing() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <p className={styles.label}>Pricing</p>
          <h1>Simple, honest pricing</h1>
          <p>Start free. Upgrade when you're ready to go unlimited.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.planCard}>
            <div className={styles.planName}>Free</div>
            <div className={styles.planPrice}>$0 <span>/ forever</span></div>
            <div className={styles.planDesc}>Perfect for trying LearnRise out with your first goal.</div>
            <div className={styles.divider} />
            <ul className={styles.planFeatures}>
              <li>✓ 1 AI-generated course</li>
              <li>✓ Streaks &amp; XP tracking</li>
              <li>✓ Public learning profile</li>
              <li>✓ Web resource search</li>
            </ul>
            <Link href="/signup" className={styles.btnFree}>Get started free</Link>
          </div>

          <div className={`${styles.planCard} ${styles.featured}`}>
            <div className={styles.badge}>Most popular</div>
            <div className={styles.planName}>Premium</div>
            <div className={styles.planPrice}>$20 <span>/ month</span></div>
            <div className={styles.planDesc}>For serious learners who want unlimited access to everything.</div>
            <div className={styles.divider} />
            <ul className={styles.planFeatures}>
              <li>✓ Unlimited AI courses</li>
              <li>✓ Everything in Free</li>
              <li>✓ Priority plan generation</li>
              <li>✓ Streak protection</li>
              <li>✓ Progress export &amp; reports</li>
              <li>✓ Early access to new features</li>
            </ul>
            <Link href="/signup" className={styles.btnPro}>Start with Premium</Link>
          </div>
        </div>

        <p className={styles.note}>No credit card required for the free plan. Cancel Premium anytime.</p>
      </main>
    </>
  )
}

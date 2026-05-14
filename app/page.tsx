import Link from 'next/link'
import Navbar from '@/components/Navbar'
import styles from './page.module.css'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.badge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            AI-powered learning companion
          </div>
          <h1>Learn anything.<br /><em>Faster than ever before.</em></h1>
          <p>Tell us what you want to master. LearnRise finds the best resources on the internet and builds you a structured course — in seconds. No searching, no chaos.</p>
          <div className={styles.heroBtns}>
            <Link href="/signup" className={styles.btnPrimary}>Start learning free</Link>
            <Link href="/pricing" className={styles.btnOutline}>See pricing</Link>
          </div>
        </section>

        {/* How it works */}
        <section className={styles.howSection}>
          <div className={styles.sectionInner}>
            <p className={styles.sectionLabel}>How it works</p>
            <div className={styles.steps}>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>1</div>
                <h3>Describe what you want</h3>
                <p>Tell us the topic, your schedule, and your goal in three simple prompts.</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>2</div>
                <h3>AI builds your course</h3>
                <p>Our AI searches the web and organizes the best resources into a real structured plan.</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>3</div>
                <h3>Learn &amp; track progress</h3>
                <p>Follow the plan daily, earn XP, build streaks, and share your journey with others.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className={styles.featuresSection}>
          <div className={styles.sectionInner}>
            <p className={styles.sectionLabel}>Features</p>
            <h2 className={styles.sectionTitle}>Everything you need to actually learn</h2>
            <p className={styles.sectionSub}>Not just another AI tool. LearnRise is a full learning companion built around your goals.</p>
            <div className={styles.featuresGrid}>
              {features.map((f) => (
                <div key={f.title} className={styles.featCard}>
                  <div className={styles.featIcon}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className={styles.ctaBanner}>
          <p className={styles.ctaLabel}>Start today</p>
          <h2>Your first course is free.</h2>
          <p>No credit card needed. Sign up and start learning in under 2 minutes.</p>
          <Link href="/signup" className={styles.ctaBtn}>Create free account</Link>
        </section>
      </main>

      <footer className={styles.footer}>
        LearnRise &nbsp;·&nbsp; Learn anything, rise faster &nbsp;·&nbsp;
        <Link href="#">Privacy</Link> &nbsp;·&nbsp; <Link href="#">Terms</Link>
      </footer>
    </>
  )
}

const features = [
  { icon: '🔍', title: 'Finds resources for you', desc: 'No more scattered links. AI searches the web and curates only what matters.' },
  { icon: '📋', title: 'Structured like a course', desc: 'Weekly plans, milestones, and ordered lessons so you always know what\'s next.' },
  { icon: '🔥', title: 'Streaks & XP', desc: 'Daily check-ins keep momentum going. Miss a day and your streak resets.' },
  { icon: '👥', title: 'Social learning profiles', desc: 'See what others are learning. Follow friends and compete on leaderboards.' },
  { icon: '🎯', title: 'Goal-first planning', desc: 'Built around your career path, school needs, or personal goals — not generic topics.' },
  { icon: '📱', title: 'Learn anywhere', desc: 'Clean, fast, mobile-friendly. Open your plan from any device, any time.' },
]

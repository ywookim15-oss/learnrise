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
          <div className={styles.heroBg} />
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              AI-powered learning companion
            </div>
            <h1>Learn anything.<br /><em>Faster than ever before.</em></h1>
            <p>Tell us what you want to master. LearnRise finds the best resources on the internet and builds you a structured course — in seconds. No searching, no chaos.</p>
            <div className={styles.heroBtns}>
              <Link href="/signup" className={styles.btnPrimary}>
                Start learning free
                <span className={styles.btnArrow}>→</span>
              </Link>
              <Link href="/pricing" className={styles.btnOutline}>See pricing</Link>
            </div>
            <div className={styles.heroStats}>
              {[['3', 'Simple prompts'], ['AI', 'Finds resources'], ['∞', 'Things to learn']].map(([val, label]) => (
                <div key={label} className={styles.heroStat}>
                  <span className={styles.heroStatVal}>{val}</span>
                  <span className={styles.heroStatLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className={styles.howSection}>
          <div className={styles.sectionInner}>
            <p className={styles.sectionLabel}>How it works</p>
            <h2 className={styles.sectionTitle}>From idea to course in seconds</h2>
            <div className={styles.steps}>
              {[
                { num: '01', title: 'Describe what you want', desc: 'Tell us the topic, your schedule, and your goal in three simple prompts.' },
                { num: '02', title: 'AI builds your course', desc: 'Our AI searches the web and organizes the best resources into a real structured plan.' },
                { num: '03', title: 'Learn & track progress', desc: 'Follow the plan daily, earn XP, build streaks, and share your journey with others.' },
              ].map(step => (
                <div key={step.num} className={styles.stepCard}>
                  <div className={styles.stepNum}>{step.num}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
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
              {features.map(f => (
                <div key={f.title} className={styles.featCard}>
                  <div className={styles.featIcon}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaBanner}>
          <div className={styles.ctaBannerBg} />
          <div className={styles.ctaContent}>
            <p className={styles.ctaLabel}>Start today</p>
            <h2>Your first course is free.</h2>
            <p>No credit card needed. Sign up and start learning in under 2 minutes.</p>
            <Link href="/signup" className={styles.ctaBtn}>
              Create free account
              <span>→</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerLogo}>LearnRise</span>
          <span>Learn anything, rise faster</span>
          <div className={styles.footerLinks}>
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  )
}

const features = [
  { icon: '🔍', title: 'Finds resources for you', desc: 'No more scattered links. AI searches the web and curates only what matters.' },
  { icon: '📋', title: 'Structured like a course', desc: 'Weekly plans, milestones, and ordered lessons so you always know what\'s next.' },
  { icon: '🔥', title: 'Streaks & XP', desc: 'Daily check-ins keep momentum going. Miss a day and your streak resets.' },
  { icon: '👥', title: 'Social learning profiles', desc: 'See what others are learning. Follow friends and compete on leaderboards.' },
  { icon: '🎯', title: 'Goal-first planning', desc: 'Built around your career path, school needs, or personal goals.' },
  { icon: '📱', title: 'Learn anywhere', desc: 'Clean, fast, mobile-friendly. Open your plan from any device, any time.' },
]

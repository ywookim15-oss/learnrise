import Link from 'next/link'
import Navbar from '@/components/Navbar'
import styles from './success.module.css'

export default function Success() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.icon}>🎉</div>
          <h1>You&apos;re now Premium!</h1>
          <p>Welcome to LearnRise Premium. You now have unlimited AI course generation, streak protection, and early access to all new features.</p>
          <Link href="/dashboard" className={styles.btn}>
            Go to dashboard →
          </Link>
        </div>
      </main>
    </>
  )
}

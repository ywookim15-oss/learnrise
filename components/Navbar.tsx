'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Navbar.module.css'

export default function Navbar() {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Learn<span>Rise</span>
        </Link>
        <div className={styles.links}>
          {isDashboard ? (
            <>
              <Link href="/dashboard" className={styles.link}>Dashboard</Link>
              <Link href="/" className={styles.link}>Home</Link>
            </>
          ) : (
            <>
              <Link href="/" className={styles.link}>Home</Link>
              <Link href="/pricing" className={styles.link}>Pricing</Link>
              <Link href="/login" className={styles.link}>Log in</Link>
            </>
          )}
        </div>
        {!isDashboard && (
          <Link href="/signup" className={styles.cta}>
            Get started free
            <span className={styles.ctaArrow}>→</span>
          </Link>
        )}
      </div>
    </nav>
  )
}

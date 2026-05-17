'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Navbar.module.css'

export default function Navbar() {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard' || pathname === '/social'

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Learn<span>Rise</span>
        </Link>
        <div className={styles.links}>
          {isDashboard ? (
            <>
              <Link href="/dashboard" className={`${styles.link} ${pathname === '/dashboard' ? styles.linkActive : ''}`}>Dashboard</Link>
              <Link href="/social" className={`${styles.link} ${pathname === '/social' ? styles.linkActive : ''}`}>Community</Link>
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

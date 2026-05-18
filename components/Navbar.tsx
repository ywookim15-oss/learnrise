'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './Navbar.module.css'

export default function Navbar() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const isDashboard = pathname === '/dashboard' || pathname === '/social'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
  }, [])

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href={isLoggedIn ? '/dashboard' : '/'} className={styles.logo}>
          Learn<span>Rise</span>
        </Link>
        <div className={styles.links}>
          {isDashboard ? (
            <>
              <Link href="/dashboard" className={`${styles.link} ${pathname === '/dashboard' ? styles.linkActive : ''}`}>Dashboard</Link>
              <Link href="/social" className={`${styles.link} ${pathname === '/social' ? styles.linkActive : ''}`}>Community</Link>
              <Link href="/pricing" className={styles.link}>Pricing</Link>
            </>
          ) : isLoggedIn ? (
            <>
              <Link href="/dashboard" className={styles.link}>Dashboard</Link>
              <Link href="/social" className={styles.link}>Community</Link>
              <Link href="/pricing" className={styles.link}>Pricing</Link>
            </>
          ) : (
            <>
              <Link href="/" className={styles.link}>Home</Link>
              <Link href="/pricing" className={styles.link}>Pricing</Link>
              <Link href="/login" className={styles.link}>Log in</Link>
            </>
          )}
        </div>
        {!isLoggedIn && (
          <Link href="/signup" className={styles.cta}>
            Get started free
            <span className={styles.ctaArrow}>→</span>
          </Link>
        )}
        {isLoggedIn && !isDashboard && (
          <Link href="/dashboard" className={styles.cta}>
            Go to dashboard
            <span className={styles.ctaArrow}>→</span>
          </Link>
        )}
      </div>
    </nav>
  )
}

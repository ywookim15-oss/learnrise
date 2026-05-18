'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './Navbar.module.css'

export default function Navbar() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isDashboard = pathname === '/dashboard' || pathname === '/social'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.inner}>
          <Link href={isLoggedIn ? '/dashboard' : '/'} className={styles.logo}>
            Learn<span>Rise</span>
          </Link>

          {/* Desktop links */}
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

          {/* Desktop CTA */}
          <div className={styles.desktopCta}>
            {!isLoggedIn ? (
              <Link href="/signup" className={styles.cta}>
                Get started free <span className={styles.ctaArrow}>→</span>
              </Link>
            ) : !isDashboard ? (
              <Link href="/dashboard" className={styles.cta}>
                Dashboard <span className={styles.ctaArrow}>→</span>
              </Link>
            ) : null}
          </div>

          {/* Hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {isDashboard ? (
            <>
              <Link href="/dashboard" className={styles.mobileLink}>Dashboard</Link>
              <Link href="/social" className={styles.mobileLink}>Community</Link>
              <Link href="/pricing" className={styles.mobileLink}>Pricing</Link>
            </>
          ) : isLoggedIn ? (
            <>
              <Link href="/dashboard" className={styles.mobileLink}>Dashboard</Link>
              <Link href="/social" className={styles.mobileLink}>Community</Link>
              <Link href="/pricing" className={styles.mobileLink}>Pricing</Link>
            </>
          ) : (
            <>
              <Link href="/" className={styles.mobileLink}>Home</Link>
              <Link href="/pricing" className={styles.mobileLink}>Pricing</Link>
              <Link href="/login" className={styles.mobileLink}>Log in</Link>
              <Link href="/signup" className={styles.mobileCta}>Get started free →</Link>
            </>
          )}
        </div>
      )}
    </>
  )
}

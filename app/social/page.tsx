'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import styles from './social.module.css'
import Link from 'next/link'

type Activity = {
  id: string
  user_id: string
  username: string
  full_name: string
  avatar_url: string
  action: string
  course_title: string
  detail: string
  created_at: string
}

type LeaderboardEntry = {
  id: string
  username: string
  full_name: string
  avatar_url: string
  streak: number
  xp: number
  level: number
}

const actionLabel: Record<string, string> = {
  created_course: 'started learning',
  completed_week: 'completed a week of',
  streak_milestone: 'hit a streak milestone in',
  level_up: 'leveled up while studying',
}

const actionIcon: Record<string, string> = {
  created_course: '🚀',
  completed_week: '✅',
  streak_milestone: '🔥',
  level_up: '⬆️',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function Social() {
  const [feed, setFeed] = useState<Activity[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [tab, setTab] = useState<'feed' | 'leaderboard'>('feed')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeed()
    loadLeaderboard()
  }, [])

  async function loadFeed() {
    const { data } = await supabase
      .from('activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setFeed(data)
    setLoading(false)
  }

  async function loadLeaderboard() {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, streak, xp, level')
      .eq('is_public', true)
      .order('xp', { ascending: false })
      .limit(20)
    if (data) setLeaderboard(data)
  }

  function getInitials(name: string, username: string) {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    return username?.slice(0, 2).toUpperCase() || '??'
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Community</h1>
          <p>See what others are learning and climbing the leaderboard.</p>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'feed' ? styles.tabActive : ''}`} onClick={() => setTab('feed')}>
            🌍 Activity feed
          </button>
          <button className={`${styles.tab} ${tab === 'leaderboard' ? styles.tabActive : ''}`} onClick={() => setTab('leaderboard')}>
            🏆 Leaderboard
          </button>
        </div>

        {tab === 'feed' && (
          <div className={styles.feed}>
            {loading && <div className={styles.empty}>Loading feed...</div>}
            {!loading && feed.length === 0 && (
              <div className={styles.empty}>
                No activity yet. Be the first to start learning!
              </div>
            )}
            {feed.map(activity => (
              <div key={activity.id} className={styles.activityCard}>
                <div className={styles.activityAvatar}>
                  {activity.avatar_url
                    ? <img src={activity.avatar_url} alt={activity.full_name} />
                    : <div className={styles.avatarPlaceholder}>{getInitials(activity.full_name, activity.username)}</div>
                  }
                </div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>
                    <Link href={`/profile/${activity.username}`} className={styles.activityName}>
                      {activity.full_name || activity.username}
                    </Link>
                    {' '}{actionLabel[activity.action] || 'did something with'}{' '}
                    <span className={styles.activityCourse}>{activity.course_title}</span>
                  </div>
                  {activity.detail && <div className={styles.activityDetail}>{activity.detail}</div>}
                  <div className={styles.activityMeta}>
                    <span>{actionIcon[activity.action]}</span>
                    <span>{timeAgo(activity.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className={styles.leaderboard}>
            <div className={styles.leaderboardHeader}>
              <span>Learner</span>
              <span>Streak</span>
              <span>XP</span>
              <span>Level</span>
            </div>
            {leaderboard.map((user, i) => (
              <Link href={`/profile/${user.username}`} key={user.id} className={styles.leaderboardRow}>
                <div className={styles.leaderboardLeft}>
                  <span className={`${styles.rank} ${i === 0 ? styles.rank1 : i === 1 ? styles.rank2 : i === 2 ? styles.rank3 : ''}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <div className={styles.leaderboardAvatar}>
                    {user.avatar_url
                      ? <img src={user.avatar_url} alt={user.full_name} />
                      : <div className={styles.avatarPlaceholder}>{getInitials(user.full_name, user.username)}</div>
                    }
                  </div>
                  <span className={styles.leaderboardName}>{user.full_name || user.username}</span>
                </div>
                <span className={styles.leaderboardStat}>🔥 {user.streak}d</span>
                <span className={styles.leaderboardStat}>{user.xp} XP</span>
                <span className={styles.leaderboardStat}>Lv. {user.level}</span>
              </Link>
            ))}
            {leaderboard.length === 0 && (
              <div className={styles.empty}>No learners yet. Sign up and be first!</div>
            )}
          </div>
        )}
      </main>
    </>
  )
}

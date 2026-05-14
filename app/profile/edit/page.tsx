'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import styles from './edit.module.css'

export default function EditProfile() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    avatar_url: '',
    is_public: true,
  })

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setForm({
          full_name: profile.full_name || '',
          username: profile.username || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || '',
          is_public: profile.is_public ?? true,
        })
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { setError('Failed to upload image.'); setUploading(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    setForm(f => ({ ...f, avatar_url: data.publicUrl }))
    setUploading(false)
  }

  async function handleSave() {
    if (!form.username) { setError('Username is required.'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) { setError('Username can only contain letters, numbers, and underscores.'); return }
    setSaving(true); setError(''); setSuccess(false)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        username: form.username.toLowerCase(),
        bio: form.bio,
        avatar_url: form.avatar_url,
        is_public: form.is_public,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      setError(error.message.includes('unique') ? 'That username is already taken.' : error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1200)
    }
    setSaving(false)
  }

  if (loading) return <div className={styles.loading}>Loading...</div>

  const initials = form.full_name
    ? form.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : form.username?.slice(0, 2).toUpperCase()

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Edit profile</h1>
          <p>Manage how others see you on LearnRise.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.avatarSection}>
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Avatar" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>{initials}</div>
            )}
            <div>
              <button className={styles.uploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload photo'}
              </button>
              <p className={styles.uploadHint}>JPG or PNG, max 2MB</p>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Full name</label>
            <input className={styles.input} type="text" placeholder="Your name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Username</label>
            <div className={styles.usernameInput}>
              <span className={styles.usernamePrefix}>learnrise.app/profile/</span>
              <input className={styles.input} type="text" placeholder="yourname" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase() }))} />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Bio</label>
            <textarea className={styles.textarea} rows={3} placeholder="Tell others what you're learning and why..." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Profile visibility</label>
            <div className={styles.toggleRow}>
              <div>
                <div className={styles.toggleLabel}>Public profile</div>
                <div className={styles.toggleDesc}>Anyone can view your profile and learning journey</div>
              </div>
              <button
                className={`${styles.toggle} ${form.is_public ? styles.toggleOn : ''}`}
                onClick={() => setForm(f => ({ ...f, is_public: !f.is_public }))}
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.successMsg}>Profile saved! Redirecting...</p>}

          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={() => router.push('/dashboard')}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

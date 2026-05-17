// Add this at the top of the existing dashboard page.tsx
// Replace the generatePlan function and add premium check to the form section

// In the useEffect init function, add this after loading profile:
// setIsPremium(prof?.subscription_status === 'active')
// setCoursesCreated(prof?.courses_created || 0)

// Replace the "New learning plan" button section with this:

export const PremiumGate = ({
  isPremium,
  coursesCreated,
  onNewPlan,
}: {
  isPremium: boolean
  coursesCreated: number
  onNewPlan: () => void
}) => {
  const canCreate = isPremium || coursesCreated < 1

  if (canCreate) {
    return (
      <button
        onClick={onNewPlan}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          border: '1.5px dashed #A8B8F8',
          borderRadius: '14px',
          padding: '1rem',
          fontSize: '13px',
          fontWeight: 500,
          color: '#1535B0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          marginTop: '0.5rem',
          fontFamily: 'Sora, sans-serif',
        }}
      >
        + New learning plan
      </button>
    )
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(12px)',
      border: '1.5px solid #A8B8F8',
      borderRadius: '16px',
      padding: '1.75rem',
      textAlign: 'center',
      marginTop: '0.5rem',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔒</div>
      <div style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', fontWeight: 500, color: '#0A0F1E', marginBottom: '0.5rem' }}>
        Upgrade to create more courses
      </div>
      <p style={{ fontSize: '13px', color: '#5A6480', fontWeight: 300, marginBottom: '1.25rem', lineHeight: 1.6 }}>
        You&apos;ve used your 1 free course. Upgrade to Premium for unlimited AI course generation.
      </p>
      <a
        href="/pricing"
        style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #1535B0, #0F2490)',
          color: '#fff',
          borderRadius: '10px',
          padding: '10px 24px',
          fontSize: '13px',
          fontWeight: 500,
          textDecoration: 'none',
          boxShadow: '0 3px 14px rgba(21,53,176,0.3)',
        }}
      >
        Upgrade to Premium — $20/mo
      </a>
    </div>
  )
}

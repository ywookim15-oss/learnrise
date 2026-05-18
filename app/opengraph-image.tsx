import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'LearnRise — Learn anything, faster'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0A1870 0%, #1535B0 50%, #1D4ED8 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          padding: '60px',
        }}
      >
        {/* Logo */}
        <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.7)', marginBottom: 24, letterSpacing: 2 }}>
          LEARNRISE
        </div>

        {/* Headline */}
        <div style={{ fontSize: 72, fontWeight: 700, color: '#ffffff', textAlign: 'center', lineHeight: 1.1, marginBottom: 24 }}>
          Learn anything.
          <br />
          <span style={{ color: '#93C5FD' }}>Faster than ever.</span>
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.75)', textAlign: 'center', maxWidth: 800, lineHeight: 1.4 }}>
          AI builds you a personalized course in seconds — no searching, no chaos.
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 16, marginTop: 48 }}>
          {['3 simple prompts', 'AI finds resources', 'Week-by-week plan'].map(text => (
            <div key={text} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 24, padding: '10px 20px', color: '#fff', fontSize: 18 }}>
              {text}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LearnRise — Learn anything, faster',
  description: 'AI-powered learning companion that finds the best resources and builds you a structured course in seconds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

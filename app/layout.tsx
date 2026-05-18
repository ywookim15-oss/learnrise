import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'LearnRise — Learn anything, faster',
    template: '%s | LearnRise',
  },
  description: 'AI-powered learning companion that finds the best resources and builds you a personalized structured course in seconds. No searching, no chaos — just learning.',
  keywords: ['AI learning', 'personalized learning', 'online courses', 'learning companion', 'AI education', 'study plan'],
  authors: [{ name: 'LearnRise' }],
  creator: 'LearnRise',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://learnrise-eight.vercel.app',
    siteName: 'LearnRise',
    title: 'LearnRise — Learn anything, faster',
    description: 'AI builds you a personalized structured course in seconds. Tell us what you want to learn and we find all the best resources for you.',
    images: [
      {
        url: 'https://learnrise-eight.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LearnRise — AI-powered learning companion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LearnRise — Learn anything, faster',
    description: 'AI builds you a personalized structured course in seconds.',
    images: ['https://learnrise-eight.vercel.app/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL('https://learnrise-eight.vercel.app'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

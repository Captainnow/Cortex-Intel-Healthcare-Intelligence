import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cortex Intel - Healthcare Intelligence Platform',
  description: 'A premium, real-time AI-powered healthcare intelligence and analysis platform.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen overflow-x-hidden`}>
        {children}
      </body>
    </html>
  )
}
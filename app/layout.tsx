import type { Metadata } from 'next'
import './globals.css'
import NotificationProvider from '@/components/NotificationProvider'

export const metadata: Metadata = {
  title: 'User-Seller Platform',
  description: 'Platform for users, sellers, and admins',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <NotificationProvider />
        {children}
      </body>
    </html>
  )
}


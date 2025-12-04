import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'واتساب بيزنس - WhatsApp Business',
  description: 'نظام إدارة محادثات واتساب بيزنس الاحترافي',
  icons: {
    icon: '/images/logo.jpg',
    shortcut: '/images/logo.jpg',
    apple: '/images/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-cairo">{children}</body>
    </html>
  )
}

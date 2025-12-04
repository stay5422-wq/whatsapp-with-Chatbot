import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'صندوق الوارد الموحد - WhatsApp Inbox',
  description: 'واجهة صندوق وارد واتساب للأعمال بتصميم مستقبلي',
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

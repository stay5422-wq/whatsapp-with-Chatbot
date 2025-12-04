import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'صندوق الوارد الموحد لواتساب بيزنس - WhatsApp Business Inbox',
  description: 'نظام إدارة محادثات واتساب بيزنس الاحترافي بتصميم مستقبلي',
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

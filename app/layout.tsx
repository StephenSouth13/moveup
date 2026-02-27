import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google' // Chuyển sang Montserrat theo yêu cầu [cite: 2026-02-27]
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Cấu hình Montserrat siêu xịn cho toàn bộ hệ thống [cite: 2026-02-27]
const montserrat = Montserrat({ 
  subsets: ["latin", "vietnamese"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: 'MoveUp - Nền tảng đào tạo nhân sự cao cấp',
  description: 'Nâng cao kỹ năng lãnh đạo và quản lý cùng các chuyên gia tư vấn quốc tế. Các chương trình đào tạo được thiết kế cho những lãnh đạo tìm kiếm sự phát triển bền vững.',
  icons: {
    // Khớp chính xác với các file bạn vừa upload trong thư mục public
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      {/* Gán font Montserrat vào body để đồng bộ 100% website [cite: 2026-02-27] */}
      <body className={`${montserrat.variable} font-sans antialiased bg-white text-slate-900`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
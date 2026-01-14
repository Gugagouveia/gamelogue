import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Gamelogue - Compartilhe suas melhores capturas',
  description: 'A rede social para gamers compartilharem suas melhores capturas de tela',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9c-1.5 0-2.5 1-2.5 2.5v3c0 1.5 1 2.5 2.5 2.5h1.5c.5 0 1-.5 1-1v-5c0-.5-.5-1-1-1H6z"/><path d="M18 9c1.5 0 2.5 1 2.5 2.5v3c0 1.5-1 2.5-2.5 2.5h-1.5c-.5 0-1-.5-1-1v-5c0-.5.5-1 1-1h1.5z"/><circle cx="7.5" cy="16.5" r="1.5" fill="white"/><circle cx="16.5" cy="16.5" r="1.5" fill="white"/><line x1="9" y1="11" x2="9" y2="13"/><line x1="8" y1="12" x2="10" y2="12"/><circle cx="15" cy="9" r="0.8" fill="white"/><circle cx="16.5" cy="10.5" r="0.8" fill="white"/><circle cx="16.5" cy="8.5" r="0.8" fill="white"/><circle cx="18" cy="10" r="0.8" fill="white"/><path d="M7 4h10c2 0 3 1 3 3v6c0 2-1 3-3 3H7c-2 0-3-1-3-3V7c0-2 1-3 3-3z" fill="none" stroke="white" stroke-width="1.5"/></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}

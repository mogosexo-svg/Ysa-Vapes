import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Cloud District — Vapeo Premium',
  description: 'Tienda premium de vapeo. Dispositivos, pods, líquidos y accesorios. Exclusivo para mayores de edad.',
  keywords: 'vape, vapeo, pods, líquidos, dispositivos, cloud district',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased bg-black text-white font-sans">
        {children}
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  )
}

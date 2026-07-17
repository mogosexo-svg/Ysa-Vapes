import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Cloud District — Vapeo Premium',
  description: 'Tienda premium de vapeo. Vape desechable hasta 40K puffs y mieles artesanales. Exclusivo para mayores de edad.',
  keywords: 'vape, vapeo, pods, mieles, cloud district',
}

const themeInit = `
(function() {
  try {
    var t = localStorage.getItem('cd_theme');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.classList.add(t);
  } catch(e) { document.documentElement.classList.add('dark'); }
})();
`

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="antialiased font-sans">
        {children}
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  )
}

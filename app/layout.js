import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Ysa-vapes - Vapeo Premium',
  description: 'Tienda de vapeo y productos premium.',
  keywords: 'vape, vapeo, pods, mieles, ysa vapes',
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

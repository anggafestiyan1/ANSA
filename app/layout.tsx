import type { Metadata, Viewport } from 'next';
import { Nunito, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { THEME_BOOT } from './theme';

const jakarta = Plus_Jakarta_Sans({ variable: '--font-jakarta', subsets: ['latin'] });
const nunito = Nunito({ variable: '--font-nunito', subsets: ['latin'], weight: ['500', '700', '800', '900'] });

export const metadata: Metadata = {
  title: 'ANSA',
  description: 'Catat pengeluaran keluarga secepat ngomong.',
  appleWebApp: { capable: true, title: 'ANSA', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0F172A',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" data-theme="navy" className={`${jakarta.variable} ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('/sw.js')})`,
          }}
        />
      </body>
    </html>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Chart, Chat } from '../icons';

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Menu utama">
      <Link href="/" className={path === '/' ? 'on' : ''} aria-current={path === '/' ? 'page' : undefined}>
        <Chat />
        Catat
      </Link>
      <Link
        href="/dashboard"
        className={path === '/dashboard' ? 'on' : ''}
        aria-current={path === '/dashboard' ? 'page' : undefined}
      >
        <Chart />
        Dashboard
      </Link>
    </nav>
  );
}

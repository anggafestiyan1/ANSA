import Link from 'next/link';
import { dashboard } from '@/lib/expenses';
import { currentMonth, dayLabel, daysInMonth, monthLabel, normalizeMonth, rupiah, shiftMonth, timeLabel } from '@/lib/month';
import { requireUser } from '@/lib/session';
import { ChevronLeft, ChevronRight } from '../../icons';
import { logout } from '../../login/actions';

const COLORS = ['var(--s1)', 'var(--s2)']; // per user; Bersama selalu var(--s3)

export default async function DashboardPage(props: { searchParams: Promise<{ month?: string; who?: string }> }) {
  await requireUser();
  const sp = await props.searchParams;
  const month = normalizeMonth(sp.month);
  const who = sp.who ?? 'semua';
  const days = daysInMonth(month);
  const d = await dashboard(month, who, days);

  const isThisMonth = month === currentMonth();
  const todayIndex = isThisMonth ? Number(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', day: 'numeric' }).format(new Date())) - 1 : -1;
  const shownDays = isThisMonth ? todayIndex + 1 : days;
  const daily = d.daily.slice(0, shownDays);
  const max = Math.max(1, ...daily);
  const spent = daily.reduce((s, n) => s + n, 0);

  const parts = [
    ...d.users.map((u, i) => ({ key: String(u.id), name: u.name, total: u.total, color: COLORS[i % COLORS.length] })),
    { key: 'bersama', name: 'Bersama', total: d.shared, color: 'var(--s3)' },
  ];
  const href = (m: string, w: string) => `/dashboard?month=${m}&who=${w}`;

  return (
    <div className="screen">
      <div className="content">
        <div className="month">
          <Link className="icon-btn" href={href(shiftMonth(month, -1), who)} aria-label="Bulan sebelumnya">
            <ChevronLeft />
          </Link>
          <h1>{monthLabel(month)}</h1>
          {isThisMonth ? (
            <span className="icon-btn ghost" aria-hidden="true" />
          ) : (
            <Link className="icon-btn" href={href(shiftMonth(month, 1), who)} aria-label="Bulan berikutnya">
              <ChevronRight />
            </Link>
          )}
        </div>

        <nav className="seg" aria-label="Saring pemilik">
          {[{ key: 'semua', name: 'Semua' }, ...parts].map((p) => (
            <Link key={p.key} href={href(month, p.key)} scroll={false} className={who === p.key ? 'on' : ''} aria-current={who === p.key ? 'true' : undefined}>
              {p.name}
            </Link>
          ))}
        </nav>

        <section className="sum">
          <div className="small">Total pengeluaran</div>
          <div className="big">{rupiah(d.total)}</div>
          <div className="split" aria-hidden="true">
            {parts.map((p) => (
              <span key={p.key} style={{ width: `${d.total ? (p.total / d.total) * 100 : 0}%`, background: p.color }} />
            ))}
          </div>
          <div className="rows">
            {parts.map((p) => (
              <div key={p.key}>
                <span className="small"><i className="dot" style={{ background: p.color }} />{p.name}</span>
                <b>{rupiah(p.total)}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="sum">
          <div className="small">
            Pengeluaran per hari · rata-rata {rupiah(shownDays > 0 ? Math.round(spent / shownDays) : 0)}
          </div>
          <div className="chart" role="img" aria-label={`Grafik pengeluaran harian ${monthLabel(month)}`}>
            {daily.map((n, i) => (
              <span key={i} className={i === todayIndex ? 'today' : ''} style={{ height: `${Math.max(2, (n / max) * 100)}%` }} title={`${i + 1}: ${rupiah(n)}`} />
            ))}
          </div>
          <div className="axis small"><span>1</span><span>{shownDays}</span></div>
        </section>

        <h2 className="small">Transaksi terakhir</h2>
        {d.recent.length === 0 && <p className="empty">Belum ada transaksi.</p>}
        {d.recent.map((t) => (
          <div className="tx" key={t.id}>
            <div className="tx-l">
              <span className="avatar" style={{ background: t.owner ? parts.find((p) => p.name === t.owner)?.color : 'var(--s3)' }}>
                {(t.owner ?? 'Bersama')[0]}
              </span>
              <div>
                {t.note || '(tanpa catatan)'}
                <div className="who">
                  {t.owner ?? `Bersama · dicatat ${t.creator}`} · {dayLabel(t.createdAt)} {timeLabel(t.createdAt)}
                </div>
              </div>
            </div>
            <b>{t.amount.toLocaleString('id-ID')}</b>
          </div>
        ))}

        <form action={logout} className="logout">
          <button className="link">Keluar</button>
        </form>
      </div>
    </div>
  );
}

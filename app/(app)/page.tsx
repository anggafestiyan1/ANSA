import { monthTotal, myRecent } from '@/lib/expenses';
import { currentMonth, monthLabel } from '@/lib/month';
import { requireUser } from '@/lib/session';
import Catat from './catat';

export default async function CatatPage() {
  const user = await requireUser();
  const month = currentMonth();
  const [entries, total] = await Promise.all([myRecent(user), monthTotal(month)]);
  return <Catat initialEntries={entries} initialTotal={total} monthName={monthLabel(month, false)} />;
}

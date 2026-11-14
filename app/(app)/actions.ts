'use server';

import { addEntry, monthTotal, setCanceled, type Entry } from '@/lib/expenses';
import { currentMonth } from '@/lib/month';
import { requireUser } from '@/lib/session';

type Result = { entry: Entry; total: number } | { error: string };

export async function addAction(rawText: unknown, source: unknown): Promise<Result> {
  const user = await requireUser();
  if (typeof rawText !== 'string' || !rawText.trim() || rawText.length > 200) return { error: 'Teks kosong atau terlalu panjang.' };
  if (source !== 'ketik' && source !== 'suara') return { error: 'Sumber input tidak dikenal.' };
  const entry = await addEntry(user, rawText.trim(), source);
  if (!entry) return { error: 'Tidak kebaca. Sebut nominalnya, mis. 15k kopi.' };
  return { entry, total: await monthTotal(currentMonth()) };
}

export async function cancelAction(id: unknown, canceled: unknown): Promise<Result> {
  const user = await requireUser();
  if (!Number.isInteger(id) || typeof canceled !== 'boolean') return { error: 'Permintaan tidak valid.' };
  const entry = await setCanceled(user, id as number, canceled);
  if (!entry) return { error: 'Catatan ini tidak bisa dibatalkan.' };
  return { entry, total: await monthTotal(currentMonth()) };
}

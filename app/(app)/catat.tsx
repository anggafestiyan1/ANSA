'use client';

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { Entry, Source } from '@/lib/expenses';
import { dayLabel, rupiah } from '@/lib/month';
import { parse } from '@/lib/parse';
import { Mic, Palette, Send } from '../icons';
import { nextTheme } from '../theme';
import { addAction, cancelAction } from './actions';

// Web Speech API: ada di Chrome, Edge, Safari (dengan awalan webkit); tidak ada di Firefox.
type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void;
  onerror: (e: { error: string }) => void;
  onend: () => void;
  start: () => void;
};
type RecognitionCtor = new () => Recognition;
const speechApi = () =>
  (window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor })
    .SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: RecognitionCtor }).webkitSpeechRecognition;

const noop = () => () => {};
const HINT ='Ketik atau tekan mic: "15k kopi", "b 50rb sayur" (bersama)';

export default function Catat(props: { initialEntries: Entry[]; initialTotal: number; monthName: string }) {
  const [entries, setEntries] = useState(props.initialEntries);
  const [total, setTotal] = useState(props.initialTotal);
  const [text, setText] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  // false saat render server, cek browser sesudah hydrate
  const canSpeak = useSyncExternalStore(noop, () => !!speechApi(), () => false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [entries.length]);

  async function send(raw: string, source: Source) {
    if (!raw.trim() || busy) return;
    if (!parse(raw)) {
      setMessage('Belum kebaca. Sebut nominalnya, mis. 15k kopi');
      return;
    }
    setBusy(true);
    const res = await addAction(raw, source);
    setBusy(false);
    if ('error' in res) return setMessage(res.error);
    setEntries((list) => [...list, res.entry]);
    setTotal(res.total);
    setText('');
    setMessage(null);
  }

  async function toggleCancel(entry: Entry) {
    const res = await cancelAction(entry.id, !entry.canceled);
    if ('error' in res) return setMessage(res.error);
    setEntries((list) => list.map((e) => (e.id === entry.id ? res.entry : e)));
    setTotal(res.total);
  }

  function listen() {
    const Api = speechApi();
    if (!Api) return;
    const rec = new Api();
    rec.lang = 'id-ID';
    rec.interimResults = true;
    rec.onresult = (e) => {
      const r = e.results[e.results.length - 1];
      setText(r[0].transcript);
      if (r.isFinal) void send(r[0].transcript, 'suara');
    };
    rec.onerror = (e) =>
      setMessage(e.error === 'not-allowed' ? 'Izin mikrofon ditolak. Ketik saja dulu.' : 'Suara tidak terdengar, coba lagi.');
    rec.onend = () => setListening(false);
    setListening(true);
    setMessage(null);
    rec.start();
  }

  const preview = text ? parse(text) : null;
  const status = listening
    ? 'Mendengarkan… sebut nominal dan catatan'
    : message ?? (!text ? HINT : preview ? `${preview.shared ? 'Bersama · ' : ''}${rupiah(preview.amount)}${preview.note ? ' · ' + preview.note : ''}` : 'Belum kebaca. Sebut nominalnya, mis. 15k kopi');

  return (
    <div className="screen">
      <header className="head">
        <div>
          <div className="small">Pengeluaran {props.monthName}</div>
          <div className="total">{rupiah(total)}</div>
        </div>
        <button className="icon-btn" onClick={nextTheme} aria-label="Ganti tema">
          <Palette />
        </button>
      </header>

      <div className="content" ref={scroller}>
        <div className="chat">
          {entries.length === 0 && <p className="empty">Belum ada catatan. Coba ketik &quot;15k kopi&quot;.</p>}
          {entries.map((e, i) => {
            const day = dayLabel(e.createdAt);
            const showDay = i === 0 || dayLabel(entries[i - 1].createdAt) !== day;
            return (
              <Fragment key={e.id}>
                {showDay && <div className="day">{day}</div>}
                <div className={'bubble' + (e.canceled ? ' canceled' : '')}>
                  <div className="raw">
                    {e.source === 'suara' && <Mic size={12} />}
                    {e.rawText}
                  </div>
                  <div className="line">
                    <div>
                      <div className="parsed">
                        {rupiah(e.amount)} {e.shared && <span className="badge">Bersama</span>}
                      </div>
                      {e.note && <div className="note">{e.note}</div>}
                    </div>
                    <button
                      className="undo"
                      onClick={() => toggleCancel(e)}
                      aria-label={`${e.canceled ? 'Urungkan pembatalan' : 'Batalkan'} ${rupiah(e.amount)} ${e.note}`}
                    >
                      {e.canceled ? 'Urungkan' : 'Batal'}
                    </button>
                  </div>
                  {e.canceled && <div className="tag">Dibatalkan, tidak dihitung</div>}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>

      <div className="compose">
        <div className="preview" aria-live="polite" data-ok={!!preview && !message && !listening}>
          {status}
        </div>
        <form
          className="bar"
          onSubmit={(ev) => {
            ev.preventDefault();
            void send(text, 'ketik');
          }}
        >
          <label htmlFor="q" className="sr">Catat pengeluaran</label>
          <input
            id="q"
            value={text}
            onChange={(ev) => {
              setText(ev.target.value);
              setMessage(null);
            }}
            placeholder="15k kopi"
            autoComplete="off"
            enterKeyHint="send"
            maxLength={200}
            autoFocus
          />
          {text || !canSpeak ? (
            <button className="round" aria-label="Kirim" disabled={busy || !text}>
              <Send />
            </button>
          ) : (
            <button type="button" className={'round' + (listening ? ' listening' : '')} onClick={listen} aria-label="Catat dengan suara">
              <Mic />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

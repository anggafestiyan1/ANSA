// Ikon garis sederhana (gaya Lucide), dekoratif: label ada di tombol/tautan pembungkusnya.
type P = { size?: number };
const base = (size: number) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
});

export const Mic = ({ size = 22 }: P) => (
  <svg {...base(size)}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
);
export const Send = ({ size = 20 }: P) => <svg {...base(size)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const Chat = ({ size = 22 }: P) => (
  <svg {...base(size)}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
);
export const Chart = ({ size = 22 }: P) => <svg {...base(size)}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></svg>;
export const Palette = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M12 3a9 9 0 0 0 0 18c1.1 0 1.5-.8 1.5-1.5 0-.9-.7-1.3-.7-2.1 0-.8.7-1.4 1.5-1.4H16a5 5 0 0 0 5-5c0-4.4-4-8-9-8z" />
    <circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7.5" r="1" /><circle cx="14.5" cy="7.5" r="1" />
  </svg>
);
export const ChevronLeft = ({ size = 18 }: P) => <svg {...base(size)}><path d="M15 6l-6 6 6 6" /></svg>;
export const ChevronRight = ({ size = 18 }: P) => <svg {...base(size)}><path d="M9 6l6 6-6 6" /></svg>;

export const THEMES = ['navy', 'gelap', 'terang', 'pink'] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_KEY = 'ansa-tema';

// Dijalankan di <head> sebelum halaman tampil, supaya tidak berkedip ke tema default.
export const THEME_BOOT = `try{var t=localStorage.getItem('${THEME_KEY}');if(${JSON.stringify(THEMES)}.indexOf(t)>=0)document.documentElement.dataset.theme=t}catch(e){}`;

export function nextTheme(): Theme {
  const now = (document.documentElement.dataset.theme ?? 'navy') as Theme;
  const t = THEMES[(THEMES.indexOf(now) + 1) % THEMES.length];
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    // mode privat: tema tetap berlaku sampai halaman ditutup
  }
  return t;
}

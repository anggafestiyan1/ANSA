// Service worker minimal: syarat "pasang aplikasi" di sebagian browser Android. Tidak menyimpan cache;
// semua permintaan tetap ke server (data pengeluaran harus selalu terbaru).
self.addEventListener('fetch', () => {});

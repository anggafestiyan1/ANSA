import { ImageResponse } from 'next/og';

/** Ikon ANSA (huruf A di atas gradien) sebagai PNG persegi. Area aman maskable: huruf di tengah 60%. */
export function brandIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3B82F6, #34D399)',
          color: '#fff',
          fontSize: size * 0.5,
          fontWeight: 700,
        }}
      >
        A
      </div>
    ),
    { width: size, height: size },
  );
}

import type { Metadata } from 'next';
import './globals.css';

const title = 'TablePop — Demo Order & Pay';
const description = 'Prova l’esperienza Order & Pay per ristoranti, bar e locali: dal QR alla comanda in pochi secondi.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'it_IT',
    images: [{
      url: '/og.png',
      width: 1731,
      height: 909,
      alt: 'TablePop — Ordina. Paga. Goditi il momento.',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="it"><body>{children}</body></html>;
}

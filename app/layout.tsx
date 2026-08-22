import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ShoppingListProvider } from '@/context/ShoppingListContext';
import { SmoothScroll } from '@/components/SmoothScroll';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Voice Cart — AI Voice Shopping Assistant',
  description: 'Voice-first AI shopping assistant with smart suggestions, seasonal picks, and NLP parsing.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0e1a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="vc-atmosphere text-vc-text min-h-screen relative antialiased font-sans">
        <SmoothScroll />
        <ShoppingListProvider>
          {children}
        </ShoppingListProvider>
      </body>
    </html>
  );
}



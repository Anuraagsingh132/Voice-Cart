import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ShoppingListProvider } from '@/context/ShoppingListContext';

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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="vc-atmosphere text-vc-text min-h-screen relative antialiased">
        <ShoppingListProvider>
          {children}
        </ShoppingListProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ShoppingListProvider } from '@/context/ShoppingListContext';

export const metadata: Metadata = {
  title: 'Voice Cart - Main Dashboard',
  description: 'Voice Command Shopping Assistant with smart suggestions, seasonal picks, and NLP parsing.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="mesh-bg text-on-surface min-h-screen relative antialiased selection:bg-primary-container selection:text-white">
        <ShoppingListProvider>
          {children}
        </ShoppingListProvider>
      </body>
    </html>
  );
}

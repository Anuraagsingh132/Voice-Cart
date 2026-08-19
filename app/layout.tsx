import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ShoppingListProvider } from '@/context/ShoppingListContext';

export const metadata: Metadata = {
  title: 'Voice Command Shopping Assistant',
  description: 'AI-powered voice-first shopping list manager with natural language parsing and smart suggestions.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-emerald-200 selection:text-emerald-900">
        <ShoppingListProvider>
          {children}
        </ShoppingListProvider>
      </body>
    </html>
  );
}

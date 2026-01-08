import type { Metadata } from 'next';
import './globals.css';
import { TagTransformerInit } from './TagTransformerInit';

export const metadata: Metadata = {
  title: 'Stencil / NextJS coexistence demo',
  description: 'A demo of using Stencil components in NextJS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TagTransformerInit />
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
          {children}
        </main>
      </body>
    </html>
  );
}

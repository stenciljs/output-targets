import type { Metadata } from 'next';
import './globals.css';
import { setTagTransformer } from 'component-library-react/tag-transform'
import { transformer } from './tag-transformer'
import { TagTransformerInit } from './TagTransformerInit';

setTagTransformer(transformer)

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
    <html lang="en" suppressHydrationWarning>
      <TagTransformerInit />
      <body>
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
          {children}
        </main>
      </body>
    </html>
  );
}

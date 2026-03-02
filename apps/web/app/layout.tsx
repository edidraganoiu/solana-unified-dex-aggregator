import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Solana DEX Quotes',
  description: 'Best route finder for SOL -> USDC'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

import QueryProvider from "../components/providers/QueryProvider";
import AuthProvider from "../components/providers/AuthProvider";
import { Toaster } from "sonner";

// Configure Playfair Display (Serif) with styles defined in project-bible
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-playfair",
});

// Configure Inter (Sans-Serif)
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: '#1a0f0f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://takshstore.com'),
  title: {
    template: '%s | Taksh Store',
    default: 'Taksh Store - Premium Canvas & Digital Invites',
  },
  description: 'Experience luxury through bespoke canvas art and high-end digital wedding invitations. Elevate your gifting and celebrations with Taksh Store.',
  applicationName: 'Taksh Store',
  authors: [{ name: 'Taksh Store Team' }],
  generator: 'Next.js',
  keywords: ['Luxury Art', 'Digital Wedding Invites', 'Bespoke Canvas', 'Premium Gifting', 'Indian Art'],
  referrer: 'origin-when-cross-origin',
  creator: 'Taksh Store',
  publisher: 'Taksh Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://takshstore.com',
    siteName: 'Taksh Store',
    title: 'Taksh Store - Premium Canvas & Digital Invites',
    description: 'Bespoke canvas art and luxurious digital experiences.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Taksh Store Luxury Experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Taksh Store - Premium Art & Invites',
    description: 'Discover bespoke luxury canvas art and tailored digital invitations.',
    images: ['/og-image.jpg'],
    creator: '@takshstore',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}

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
  title: "Taksh Store",
  description: "A luxurious visual experience",
  icons: {
    icon: '/assets/images/favicon.png',
    apple: '/assets/images/apple-touch-icon.png',
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

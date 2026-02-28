import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "../components/animations/SmoothScroll";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import CollectionDrawer from "../components/layout/CollectionDrawer";

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

export const metadata: Metadata = {
  title: "Taksh Store",
  description: "A luxurious visual experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased`}>
        <SmoothScroll>
          <Header />
          <CollectionDrawer />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Backup Scheluder",
  description: "después",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="bg-black">
      <body className={inter.className}>
        <nav className="w-full p-4">
          <Navbar />
        </nav>
        {children}
      </body>
    </html>
  );
}

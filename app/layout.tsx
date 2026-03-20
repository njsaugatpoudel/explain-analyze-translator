import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI DBA | Postgres EXPLAIN Visualizer",
  description: "Visualize and fix slow PostgreSQL queries instantly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen relative`}>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none"></div>
        {children}
      </body>
    </html>
  );
}

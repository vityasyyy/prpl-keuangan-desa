import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SIPKD - Sistem Informasi Pengelolaan Keuangan Desa",
  description: "Platform digital untuk pengelolaan keuangan desa yang terintegrasi, mulai dari perencanaan anggaran hingga pelaporan akhir tahun.",
  keywords: ["keuangan desa", "SIPKD", "APBDes", "kas umum", "pengelolaan keuangan"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

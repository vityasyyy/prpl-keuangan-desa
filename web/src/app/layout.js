import { Geist, Geist_Mono, Inter, Poppins, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth";
import { ToastProvider } from "@/features/bank-desa/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
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
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} ${plusJakartaSans.variable} antialiased flex h-screen overflow-hidden font-sans`}
      >
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import { Geist, Geist_Mono, Inter, Poppins, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/features/bank-desa/components/Sidebar";

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
  title: "Sistem Keuangan Desa",
  description: "Sistem Keuangan Desa Banguntapan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} ${plusJakartaSans.variable} antialiased flex h-screen overflow-hidden font-sans`}
      >
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}

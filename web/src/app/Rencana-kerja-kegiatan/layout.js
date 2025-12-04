import { Inter } from "next/font/google";
import Sidebar from "@/components/dpa/sidebar";
import BreadCrumb from "@/components/dpa/breadCrumb";

const inter = Inter({ subsets: ["latin"] });

const metadata = {
  category: "Rencana & Kegiatan",
  title: "Rencana Kerja Kegiatan",
  description: "Rencana Kerja dan Kegiatan Desa Banguntapan",
};

export default function RABLayout({ children }) {
  return (
    <div className={`${inter.className} flex min-h-screen bg-white text-gray-900`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-16 py-8">
        <BreadCrumb category={metadata.category} title={metadata.title} />
        {children}
      </main>
    </div>
  );
}

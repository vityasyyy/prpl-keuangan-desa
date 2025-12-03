import Sidebar from "@/features/bank-desa/components/Sidebar";

export default function BukuBankLayout({ children }) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-white">
        {children}
      </main>
    </>
  );
}

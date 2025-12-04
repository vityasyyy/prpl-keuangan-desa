'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Buku Kas Umum',
    description: 'Kelola pencatatan kas umum desa dengan mudah dan terstruktur.',
    href: '/Kas-umum',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Buku Bank Desa',
    description: 'Pantau dan kelola rekening bank desa secara real-time.',
    href: '/Buku-bank',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
      </svg>
    ),
    title: 'Pembantu Pajak',
    description: 'Catat dan kelola transaksi pajak desa dengan akurat.',
    href: '/Kas-pembantu-pajak',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'Pembantu Panjar',
    description: 'Kelola panjar kegiatan desa dengan sistematis.',
    href: '/Kas-pembantu-panjar',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: 'Pembantu Kegiatan',
    description: 'Catat anggaran dan realisasi setiap kegiatan desa.',
    href: '/Kas-pembantu-kegiatan',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Laporan & APBDes',
    description: 'Buat laporan keuangan dan APBDes secara otomatis.',
    href: '#',
  },
];

export default function Home() {
  const { user } = useAuth() || {};

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#414141] rounded-full text-white text-sm font-medium font-['Plus_Jakarta_Sans'] mb-6">
              Sistem Informasi Pengelolaan Keuangan Desa
            </div>

            {/* Main Heading */}
            <h1 className="font-['Plus_Jakarta_Sans'] text-[31px] sm:text-[40px] lg:text-[50px] leading-tight font-bold text-black mb-6">
              Kelola Keuangan Desa Lebih Mudah dan Transparan
            </h1>

            {/* Subtitle */}
            <p className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg text-black mb-10 max-w-2xl mx-auto">
              Platform digital untuk pengelolaan keuangan desa yang terintegrasi, 
              mulai dari perencanaan anggaran hingga pelaporan akhir tahun.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Link
                  href="/Kas-umum"
                  className="flex px-[14px] py-2 justify-center items-center gap-2 rounded-lg border border-[#0479ce] bg-[#0479ce] text-white font-['Inter'] text-sm font-medium shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
                >
                  Buka Dashboard
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="flex px-[14px] py-2 justify-center items-center gap-2 rounded-lg border border-[#099250] bg-[#099250] text-white font-['Inter'] text-sm font-medium shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
                  >
                    Mulai Sekarang
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/auth/login"
                    className="flex px-[14px] py-2 justify-center items-center gap-2 rounded-lg border border-[#4b5565] bg-transparent text-[#364152] font-['Inter'] text-sm font-medium shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Masuk
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full h-0 border-t border-black/10"></div>
      </div>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-['Plus_Jakarta_Sans'] text-[31px] font-bold text-black mb-4">
              Fitur Lengkap untuk Pengelolaan Keuangan
            </h2>
            <p className="font-['Plus_Jakarta_Sans'] text-base text-black">
              Semua yang Anda butuhkan untuk mengelola keuangan desa dalam satu platform terintegrasi.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group flex flex-col items-start gap-4 p-6 rounded-[30px] border-[0.5px] border-[#4b5565] hover:bg-gray-50 transition-colors"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-[#d9d9d9] flex items-center justify-center text-[#414141]">
                  {feature.icon}
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-black mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-['Plus_Jakarta_Sans'] text-base text-black">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-[30px] bg-[#414141] p-8 sm:p-12 text-center">
            <h2 className="font-['Plus_Jakarta_Sans'] text-[24px] sm:text-[31px] font-bold text-white mb-4">
              Siap Memulai Digitalisasi Keuangan Desa?
            </h2>
            <p className="font-['Plus_Jakarta_Sans'] text-base text-white/80 mb-8 max-w-2xl mx-auto">
              Bergabung sekarang dan nikmati kemudahan pengelolaan keuangan desa yang transparan dan akuntabel.
            </p>
            {!user && (
              <Link
                href="/auth/register"
                className="inline-flex px-[14px] py-2 justify-center items-center gap-2 rounded-lg bg-[#e9e9e9] text-black font-['Inter'] text-sm font-medium shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
              >
                Daftar Gratis
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#414141] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#d9d9d9] flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#414141]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] leading-tight">SIPKD</span>
                  <span className="text-sm text-white/70 font-['Plus_Jakarta_Sans'] leading-tight">Keuangan Desa</span>
                </div>
              </div>
              <p className="font-['Plus_Jakarta_Sans'] text-sm text-white/70 max-w-md">
                Sistem Informasi Pengelolaan Keuangan Desa untuk mewujudkan tata kelola keuangan desa yang transparan, akuntabel, dan efisien.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-['Poppins'] text-base font-bold text-white mb-4">Menu</h4>
              <ul className="space-y-2 font-['Plus_Jakarta_Sans'] text-sm">
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Beranda</Link></li>
                <li><Link href="/Kas-umum" className="text-white/70 hover:text-white transition-colors">Kas Umum</Link></li>
                <li><Link href="/Buku-bank" className="text-white/70 hover:text-white transition-colors">Buku Bank</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-['Poppins'] text-base font-bold text-white mb-4">Kontak</h4>
              <ul className="space-y-2 font-['Plus_Jakarta_Sans'] text-sm text-white/70">
                <li>support@sipkd.id</li>
                <li>+62 21 1234 5678</li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-0 border-t border-white/25 mb-8"></div>

          <div className="text-center font-['Plus_Jakarta_Sans'] text-sm text-white/70">
            <p>&copy; {new Date().getFullYear()} SIPKD - Sistem Informasi Pengelolaan Keuangan Desa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

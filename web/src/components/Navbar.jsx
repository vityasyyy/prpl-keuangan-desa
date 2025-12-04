'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth() || {};
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      // ignore
    }
    logout?.();
    router.push('/auth/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#414141] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d9d9d9] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#414141]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] leading-tight">SIPKD</span>
              <span className="text-sm text-white/70 font-['Plus_Jakarta_Sans'] leading-tight">Keuangan Desa</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-bold text-white font-['Poppins'] hover:bg-white/10 rounded-lg transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/Kas-umum"
              className="px-4 py-2 text-sm font-normal text-white font-['Plus_Jakarta_Sans'] hover:bg-white/10 rounded-lg transition-colors"
            >
              Kas Umum
            </Link>
            <Link
              href="/Buku-bank"
              className="px-4 py-2 text-sm font-normal text-white font-['Plus_Jakarta_Sans'] hover:bg-white/10 rounded-lg transition-colors"
            >
              Buku Bank
            </Link>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#d9d9d9] flex items-center justify-center">
                    <span className="text-xs font-bold text-[#414141] uppercase">
                      {user.nama?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
                    {user.nama || user.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex h-[34px] px-2.5 justify-center items-center gap-2.5 rounded-[10px] bg-[#e9e9e9] border-none cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M10 14H12.6667C13.0203 14 13.3594 13.8595 13.6095 13.6095C13.8595 13.3594 14 13.0203 14 12.6667V3.33333C14 2.97971 13.8595 2.64057 13.6095 2.39052C13.3594 2.14048 13.0203 2 12.6667 2H10M5.33333 11.3333L2 8M2 8L5.33333 4.66667M2 8H10"
                      stroke="#121926"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-black font-['Plus_Jakarta_Sans'] text-sm font-normal">Keluar</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-normal text-white font-['Plus_Jakarta_Sans'] hover:bg-white/10 rounded-lg transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="flex h-[34px] px-4 justify-center items-center gap-2.5 rounded-[10px] bg-[#0479ce] text-white font-['Plus_Jakarta_Sans'] text-sm font-medium"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/25">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                className="px-4 py-3 text-sm font-bold text-white font-['Poppins'] hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link
                href="/Kas-umum"
                className="px-4 py-3 text-sm font-normal text-white font-['Plus_Jakarta_Sans'] hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Kas Umum
              </Link>
              <Link
                href="/Buku-bank"
                className="px-4 py-3 text-sm font-normal text-white font-['Plus_Jakarta_Sans'] hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Buku Bank
              </Link>
              <div className="my-2 border-t border-white/25" />
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-white/70 font-['Plus_Jakarta_Sans']">
                    Masuk sebagai <strong className="text-white">{user.nama || user.username}</strong>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="mx-4 flex h-[34px] px-2.5 justify-center items-center gap-2.5 rounded-[10px] bg-[#e9e9e9] border-none cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M10 14H12.6667C13.0203 14 13.3594 13.8595 13.6095 13.6095C13.8595 13.3594 14 13.0203 14 12.6667V3.33333C14 2.97971 13.8595 2.64057 13.6095 2.39052C13.3594 2.14048 13.0203 2 12.6667 2H10M5.33333 11.3333L2 8M2 8L5.33333 4.66667M2 8H10"
                        stroke="#121926"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-black font-['Plus_Jakarta_Sans'] text-sm font-normal">Keluar</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-3 text-sm font-normal text-white font-['Plus_Jakarta_Sans'] hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/auth/register"
                    className="mx-4 flex h-[34px] px-4 justify-center items-center gap-2.5 rounded-[10px] bg-[#0479ce] text-white font-['Plus_Jakarta_Sans'] text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

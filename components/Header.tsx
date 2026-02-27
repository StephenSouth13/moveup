"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const PHONE_NUMBER = '1900 1234';
const LOGO_TEXT = 'MOVEUP';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 font-montserrat">
      {/* Top Bar cực mỏng cho hotline - giống kiểu các trang Global */}
      <div className="w-full bg-slate-50 border-b border-slate-100 py-2">
        <div className="max-w-7xl mx-auto px-6 flex justify-end">
          <a href={`tel:${PHONE_NUMBER}`} className="text-[10px] tracking-[0.2em] font-medium text-slate-400 hover:text-blue-600 transition-colors uppercase">
            Support: {PHONE_NUMBER}
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        {/* Logo: Font Montserrat nhưng để font-light hoặc medium cho sang, không để bold dày */}
        <Link href="/" className="group">
          <span className="text-2xl font-light tracking-[0.3em] text-slate-900">
            {LOGO_TEXT.split('').join(' ')}
          </span>
        </Link>

        {/* Navigation: Chữ nhỏ, giãn cách rộng (tracking-widest) */}
        <nav className="hidden md:flex items-center gap-12">
          {['Courses', 'Paths', 'About', 'Contact'].map((item) => (
            <Link 
              key={item}
              href={`/${item.toLowerCase()}`} 
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-slate-900 hover:after:w-full after:transition-all"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Action Button: Hình chữ nhật sắc cạnh, không bo góc (rounded-none) hoặc rất ít */}
        <div className="flex items-center gap-6">
          {user ? (
            <Link 
              href="/dashboard" 
              className="text-[11px] font-bold uppercase tracking-[0.2em] border border-slate-900 px-8 py-3 hover:bg-slate-900 hover:text-white transition-all duration-500"
            >
              My Learning
            </Link>
          ) : (
            <Link 
              href="/auth/login" 
              className="text-[11px] font-bold uppercase tracking-[0.2em] bg-slate-900 text-white px-8 py-3 border border-slate-900 hover:bg-white hover:text-slate-900 transition-all duration-500"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
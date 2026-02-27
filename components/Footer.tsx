"use client";

import React from "react";
import Link from "next/link";

const PHONE_NUMBER = '1900 1234';
const COMPANY_NAME = 'MOVEUP';
const EMAIL = 'info@moveup.vn';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 py-24 px-6 font-montserrat">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          
          {/* Brand - Typography mỏng và giãn cách cực rộng */}
          <div className="md:col-span-5">
            <h3 className="text-2xl font-light tracking-[0.4em] text-slate-900 mb-8 uppercase">
              {COMPANY_NAME.split('').join(' ')}
            </h3>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 leading-relaxed max-w-sm">
              Nền tảng đào tạo nhân sự cao cấp dành cho những lãnh đạo khao khát sự phát triển bền vững và đột phá.
            </p>
          </div>

          {/* Quick Links - Header nhỏ, font-semibold */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8">Điều hướng</h4>
            <ul className="space-y-4">
              {['About', 'Courses', 'Learning Path', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase().replace(' ', '-')}`} 
                    className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400 hover:text-slate-900 transition-all"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact - Tối giản thông tin */}
          <div className="md:col-span-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8">Liên hệ</h4>
            <div className="space-y-6">
              <div>
                <span className="block text-[9px] uppercase tracking-[0.2em] text-slate-300 mb-1">Hotline</span>
                <p className="text-sm font-light tracking-widest text-slate-900">{PHONE_NUMBER}</p>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-[0.2em] text-slate-300 mb-1">Email</span>
                <p className="text-sm font-light tracking-widest text-slate-900">{EMAIL}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Hairline border mảnh */}
        <div className="border-t border-slate-100 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400">
            © {currentYear} {COMPANY_NAME} — Toàn bộ bản quyền được bảo lưu.
          </p>
          <div className="flex gap-8">
            {['Instagram', 'LinkedIn', 'Facebook'].map((social) => (
              <a 
                key={social} 
                href="#" 
                className="text-[9px] uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
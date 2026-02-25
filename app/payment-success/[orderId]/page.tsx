'use client'

import Link from 'next/link'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full px-4 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-light text-slate-900 mb-4">
          Thanh toán thành công!
        </h1>

        <p className="text-slate-600 mb-8">
          Cảm ơn bạn đã mua các khóa học. Bạn đã được tự động đăng ký vào các khóa học đã mua và có thể bắt đầu học ngay.
        </p>

        <div className="space-y-3">
          <Link href="/dashboard">
            <button className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
              Xem các khóa học của tôi
            </button>
          </Link>
          <Link href="/courses">
            <button className="w-full px-6 py-3 border border-slate-200 text-slate-900 font-medium rounded-lg hover:bg-slate-50">
              Tiếp tục mua sắm
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

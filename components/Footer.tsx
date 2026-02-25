const PHONE_NUMBER = '1900 1234'
const COMPANY_NAME = 'MoveUp'
const EMAIL = 'info@moveup.vn'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-light text-slate-900 mb-4">{COMPANY_NAME}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Nền tảng đào tạo nhân sự cao cấp cho các lãnh đạo tìm kiếm sự phát triển bền vững.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-4">Liên kết</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Khóa học
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-4">Liên hệ</h4>
            <p className="text-sm text-slate-500 mb-2">
              Hotline: <span className="font-medium text-slate-900">{PHONE_NUMBER}</span>
            </p>
            <p className="text-sm text-slate-500">
              Email: {EMAIL}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 pt-8">
          <p className="text-xs text-slate-500 text-center">
            © {currentYear} {COMPANY_NAME}. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  )
}

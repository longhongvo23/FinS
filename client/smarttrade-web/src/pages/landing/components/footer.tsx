import { Link } from 'react-router-dom'

const footerLinks = {
  products: {
    title: 'Sản phẩm',
    links: [
      { label: 'Tính năng', href: '#features' },
      { label: 'Dữ liệu và quy mô', href: '#stats' },
      { label: 'API', href: '/api' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
}

export function LandingFooter() {
  return (
    <footer className="border-t border-gray-200 dark:border-[#1E1E1E] py-16 px-6 bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              SmartTrade<span className="text-orange-500">.</span>
            </p>
            <div className="w-8 h-0.5 bg-orange-500 mb-4" />
            <p className="text-sm text-gray-500 dark:text-[#64748B]">Trường Đại học Kiến trúc Hà Nội</p>
            <p className="text-sm text-gray-500 dark:text-[#64748B]">Việt Nam</p>
            <p className="text-sm text-gray-500 dark:text-[#64748B] mt-4">© {new Date().getFullYear()} SmartTrade</p>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-[#64748B] mb-4">
                {section.title}
              </p>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="text-sm text-gray-600 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-gray-600 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-200 dark:border-[#1E1E1E] gap-4">
          <p className="text-xs text-gray-500 dark:text-[#64748B]">
            Tất cả dữ liệu chậm ít nhất 15 phút
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-[#00C853]" />
            <span className="text-xs text-gray-500 dark:text-[#64748B]">Hệ thống hoạt động bình thường</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

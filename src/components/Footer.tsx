export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#060610]">
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ec4899] to-[#8b5cf6]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M7 4V20M17 4V20M3 8H21M3 16H21M3 4H21V20H3V4Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[18px] font-bold tracking-tight">Cineora</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/50">
              Premium movie discovery, crafted for cinephiles. Dark mode by default. Built with Next.js, TypeScript & Tailwind.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <h4 className="font-semibold text-white">Explore</h4>
              <ul className="mt-3 space-y-2 text-white/50">
                <li><a href="#" className="hover:text-white">Trending</a></li>
                <li><a href="#" className="hover:text-white">New Releases</a></li>
                <li><a href="#" className="hover:text-white">Collections</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Company</h4>
              <ul className="mt-3 space-y-2 text-white/50">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Legal</h4>
              <ul className="mt-3 space-y-2 text-white/50">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Cineora. Beginner-friendly demo • No real movie API connected yet.</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}

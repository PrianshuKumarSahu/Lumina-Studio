import Link from 'next/link';
import { Sparkles, Home, Plus } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-gray-900 tracking-tight leading-tight">
                FêteCraft
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase leading-tight">
                AI Event Studio
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </Link>
            <Link
              href="/create"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Event</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

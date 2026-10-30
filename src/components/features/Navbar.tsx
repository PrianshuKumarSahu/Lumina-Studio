import Link from 'next/link';
import { Sparkles, Home, Plus } from 'lucide-react';

export default function Navbar() {
  return (
    <header role="banner" className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav aria-label="Main Navigation" className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Lumina Studio - Home"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-xl"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-gray-900 tracking-tight leading-tight">
                Lumina Studio
              </span>
              <span className="text-[10px] text-gray-600 font-semibold tracking-wider uppercase leading-tight">
                AI Celebration Architect
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              aria-label="Go to Events overview"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-950 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 transition-colors"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Events</span>
            </Link>
            <Link
              href="/create"
              aria-label="Plan a new event"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">New Event</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

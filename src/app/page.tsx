'use client';

import { useEffect, useState } from 'react';
import { getEvents, deleteEvent } from '@/lib/database/queries';
import type { Event } from '@/lib/database/types';
import Navbar from '@/components/features/Navbar';
import EventCard from '@/components/features/EventCard';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { PartyPopper, Plus, Trash2, Loader2 } from 'lucide-react';
import { APP_TAGLINE } from '@/lib/frontend/constants';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero section */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                Your Events
              </h1>
              <p className="text-gray-500 text-base">{APP_TAGLINE}</p>
            </div>
            <Link href="/create">
              <Button icon={<Plus className="h-4 w-4" />} size="lg">
                Plan New Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-gray-300 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={<PartyPopper className="h-16 w-16" />}
            title="No events yet"
            description="Start planning your first celebration! Our AI will help you create the perfect event with budgets, timelines, and creative ideas."
            action={
              <Link href="/create">
                <Button icon={<Plus className="h-4 w-4" />} size="lg">
                  Create Your First Event
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {events.map((event, i) => (
              <div key={event.id} className="relative group">
                <EventCard event={event} index={i} />
                <button
                  onClick={(e) => handleDelete(e, event.id)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/80 backdrop-blur-sm text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Delete event"
                >
                  {deleting === event.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between text-xs text-gray-400">
          <span>Lumina Studio</span>
          <span>Built with AI • PromptWars Challenge 5</span>
        </div>
      </footer>
    </div>
  );
}

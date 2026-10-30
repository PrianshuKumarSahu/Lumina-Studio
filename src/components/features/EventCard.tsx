'use client';

import Link from 'next/link';
import type { Event } from '@/lib/database/types';
import { EVENT_TYPE_LABELS } from '@/lib/database/types';
import { formatCurrency, formatDate, daysUntil, getEventThemeColors } from '@/lib/frontend/utils';
import { Calendar, Users, Wallet, ArrowRight, MapPin } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

interface EventCardProps {
  event: Event;
  index: number;
}

export default function EventCard({ event, index }: EventCardProps) {
  const theme = getEventThemeColors(event.event_type);
  const days = event.target_date ? daysUntil(event.target_date) : null;

  return (
    <article
      className="animate-fade-in opacity-0"
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
    >
      <Link
        href={`/event/${event.id}`}
        aria-label={`Open event dashboard for ${event.title}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-2xl"
      >
        <Card hover className="group cursor-pointer relative overflow-hidden">
          {/* Subtle gradient background accent */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-40 group-hover:opacity-60 transition-opacity`}
            aria-hidden="true"
          />

          <div className="relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge>
                    {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                  </Badge>
                  {days !== null && days >= 0 && (
                    <span className="text-xs text-gray-600 font-semibold">
                      {days === 0 ? 'Today!' : `${days}d away`}
                    </span>
                  )}
                  {days !== null && days < 0 && (
                    <span className="text-xs text-gray-500 font-medium">
                      Past event
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                  {event.title}
                </h3>
              </div>
              <div className="p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors ml-3" aria-hidden="true">
                <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 font-medium">
              {event.target_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
                  <span>{formatDate(event.target_date)}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
                <span>{event.guest_count} guests</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
                <span>{formatCurrency(event.total_budget)}</span>
              </span>
              {event.location_city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
                  <span>{event.location_city}</span>
                </span>
              )}
            </div>

            {/* Theme vibe tag */}
            {event.theme_vibe && (
              <p className="mt-3 text-xs text-gray-600 italic truncate font-medium">
                &ldquo;{event.theme_vibe}&rdquo;
              </p>
            )}
          </div>
        </Card>
      </Link>
    </article>
  );
}

'use client';

import { use, useEffect, useState } from 'react';
import { getEvent } from '@/lib/database/queries';
import type { Event } from '@/lib/database/types';
import EventDashboard from '@/components/features/EventDashboard';
import { Loader2 } from 'lucide-react';

export default function EventDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getEvent(id);
      setEvent(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-gray-300 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-lg font-medium text-gray-700 mb-2">Event not found</p>
        <p className="text-sm text-gray-400">This event may have been deleted.</p>
      </div>
    );
  }

  return <EventDashboard event={event} onEventUpdate={setEvent} />;
}

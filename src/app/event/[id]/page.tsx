import { Suspense } from 'react';
import Navbar from '@/components/features/Navbar';
import EventDetailClient from './EventDetailClient';
import { Loader2 } from 'lucide-react';

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 text-gray-300 animate-spin" />
          </div>
        }
      >
        <EventDetailClient params={params} />
      </Suspense>
    </div>
  );
}

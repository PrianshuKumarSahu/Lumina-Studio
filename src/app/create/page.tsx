import Navbar from '@/components/features/Navbar';
import CreateEventForm from '@/components/features/CreateEventForm';

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <CreateEventForm />
      </main>
    </div>
  );
}

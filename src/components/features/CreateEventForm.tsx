'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent } from '@/lib/database/queries';
import { type EventType } from '@/lib/database/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import { useLoading } from '@/lib/frontend/hooks';
import { Sparkles, PartyPopper, ArrowRight, ArrowLeft } from 'lucide-react';

const EVENT_TYPES: Array<{ value: EventType; emoji: string; label: string; desc: string }> = [
  { value: 'wedding', emoji: '💍', label: 'Wedding', desc: 'The big day deserves a perfect plan' },
  { value: 'birthday', emoji: '🎂', label: 'Birthday', desc: 'From intimate to grand celebrations' },
  { value: 'anniversary', emoji: '🥂', label: 'Anniversary', desc: 'Celebrate milestones in style' },
  { value: 'baby_shower', emoji: '👶', label: 'Baby Shower', desc: 'Welcome the newest member' },
  { value: 'community', emoji: '🎪', label: 'Community Event', desc: 'Festivals, fundraisers & more' },
  { value: 'corporate', emoji: '💼', label: 'Corporate', desc: 'Professional events that impress' },
];

export default function CreateEventForm() {
  const router = useRouter();
  const { isLoading, error, execute } = useLoading();
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPlan, setAiPlan] = useState<string | null>(null);

  const [form, setForm] = useState({
    event_type: '' as EventType | '',
    title: '',
    target_date: '',
    guest_count: 50,
    total_budget: 100000,
    location_city: '',
    theme_vibe: '',
    notes: '',
  });

  const update = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const generateAIPlan = async () => {
    setIsGenerating(true);
    setAiPlan(null);
    try {
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: form.event_type,
          guestCount: form.guest_count,
          budget: form.total_budget,
          targetDate: form.target_date,
          location: form.location_city,
          theme: form.theme_vibe,
          additionalNotes: form.notes,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiPlan(data.result);
    } catch (err) {
      console.error(err);
      setAiPlan('Failed to generate plan. You can still create the event and generate ideas later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    await execute(async () => {
      const newEvent = await createEvent({
        ...form,
        event_type: form.event_type as EventType,
        ai_summary: aiPlan,
        color_palette: [],
      });
      router.push(`/event/${newEvent.id}`);
      return newEvent;
    });
  };

  // Step 0: Choose event type
  if (step === 0) {
    return (
      <section aria-labelledby="choose-celebration-title" className="space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 id="choose-celebration-title" className="text-3xl font-bold text-gray-900 tracking-tight">
            What are we celebrating?
          </h1>
          <p className="text-gray-600 text-base">
            Choose your event type and we&apos;ll tailor everything to match
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto" role="group" aria-label="Event Types">
          {EVENT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                update('event_type', type.value);
                setStep(1);
              }}
              aria-label={`Select ${type.label} - ${type.desc}`}
              className="group text-left p-5 rounded-2xl border-2 border-gray-200 bg-white hover:border-gray-900 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 transition-all duration-200 active:scale-[0.98]"
            >
              <span className="text-3xl block mb-3" aria-hidden="true">{type.emoji}</span>
              <span className="text-base font-bold text-gray-900 block mb-1">
                {type.label}
              </span>
              <span className="text-xs text-gray-600 font-medium">{type.desc}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  // Step 1: Event details
  if (step === 1) {
    return (
      <section aria-labelledby="event-details-heading" className="max-w-xl mx-auto space-y-6 animate-fade-in">
        <button
          onClick={() => setStep(0)}
          aria-label="Back to event selection"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-lg p-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        <div>
          <h2 id="event-details-heading" className="text-2xl font-bold text-gray-900 mb-1">Event Details</h2>
          <p className="text-gray-600 text-sm">
            Tell us the basics — the AI will handle the rest
          </p>
        </div>

        <Card>
          <div className="space-y-5">
            <Input
              label="Event Name *"
              required
              placeholder="e.g., Priya & Rahul's Garden Wedding"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Date"
                type="date"
                value={form.target_date}
                onChange={(e) => update('target_date', e.target.value)}
              />
              <Input
                label="Guest Count"
                type="number"
                min={1}
                value={form.guest_count}
                onChange={(e) => update('guest_count', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Budget (₹)"
                type="number"
                min={0}
                step={5000}
                value={form.total_budget}
                onChange={(e) => update('total_budget', parseInt(e.target.value) || 0)}
              />
              <Input
                label="City / Location"
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                value={form.location_city}
                onChange={(e) => update('location_city', e.target.value)}
              />
            </div>

            <Input
              label="Theme / Vibe"
              placeholder="e.g., Rustic Garden Party or Elegant Black Tie"
              value={form.theme_vibe}
              onChange={(e) => update('theme_vibe', e.target.value)}
            />

            <Textarea
              label="Special Notes or Traditions"
              placeholder="Dietary restrictions, cultural traditions, must-have elements..."
              rows={3}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </div>
        </Card>

        <div className="flex gap-3 flex-col sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => {
              setStep(2);
              generateAIPlan();
            }}
            icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
            disabled={!form.title || !form.event_type}
          >
            Generate AI Plan
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handleSubmit}
            isLoading={isLoading}
            icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            disabled={!form.title || !form.event_type}
          >
            Skip to Dashboard
          </Button>
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600 text-center">{error}</p>
        )}
      </section>
    );
  }

  // Step 2: AI-generated plan preview
  return (
    <section aria-labelledby="blueprint-heading" className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <button
        onClick={() => setStep(1)}
        aria-label="Back to details edit"
        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-lg p-1 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to details
      </button>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm">
          <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h2 id="blueprint-heading" className="text-2xl font-bold text-gray-900">Your AI Event Blueprint</h2>
          <p className="text-gray-600 text-sm">
            Personalized plan based on your celebration requirements
          </p>
        </div>
      </div>

      <Card className="relative">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4" role="status" aria-label="Generating your plan">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-gray-600 animate-pulse-soft" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800">Crafting your custom blueprint...</p>
              <p className="text-xs text-gray-600 mt-1">
                Analyzing budgets, timelines, and vendor recommendations
              </p>
            </div>
          </div>
        ) : aiPlan ? (
          <div className="ai-prose text-sm text-gray-800 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto pr-2">
            {aiPlan}
          </div>
        ) : null}
      </Card>

      <div className="flex gap-3 flex-col sm:flex-row">
        <Button
          variant="secondary"
          size="lg"
          onClick={generateAIPlan}
          disabled={isGenerating}
          icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
        >
          Regenerate Plan
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={handleSubmit}
          isLoading={isLoading}
          icon={<PartyPopper className="h-4 w-4" aria-hidden="true" />}
          disabled={!form.title}
        >
          Create Event & Open Dashboard
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600 text-center">{error}</p>
      )}
    </section>
  );
}

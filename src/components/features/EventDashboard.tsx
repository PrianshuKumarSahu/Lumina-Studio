'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Event, TimelineItem, BudgetItem, Vendor, Guest, IdeaAndMood } from '@/lib/database/types';
import { EVENT_TYPE_LABELS } from '@/lib/database/types';
import {
  getTimelineItems, createTimelineItem, updateTimelineItem, deleteTimelineItem,
  getBudgetItems, createBudgetItem, updateBudgetItem, deleteBudgetItem,
  getVendors, createVendor, updateVendor, deleteVendor,
  getGuests, createGuest, updateGuest, deleteGuest,
  getIdeas, createIdea, deleteIdea,
  updateEvent,
} from '@/lib/database/queries';
import { formatCurrency, daysUntil, getEventThemeColors, getProgressColor } from '@/lib/frontend/utils';
import { PHASE_LABELS, VENDOR_STATUS_CONFIG, RSVP_CONFIG } from '@/lib/frontend/constants';
import { BUDGET_CATEGORIES, VENDOR_CATEGORIES } from '@/lib/database/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import {
  Calendar, Users, Wallet, MapPin, Sparkles, Plus, Check, Trash2,
  ClipboardList, Clock, Store, UserPlus, Lightbulb, FileText,
  ChevronDown, ChevronUp, Send, Loader2, Download,
} from 'lucide-react';

type Tab = 'overview' | 'timeline' | 'budget' | 'vendors' | 'guests' | 'ideas';

interface EventDashboardProps {
  event: Event;
  onEventUpdate: (event: Event) => void;
}

export default function EventDashboard({ event, onEventUpdate }: EventDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [ideas, setIdeas] = useState<IdeaAndMood[]>([]);
  const [loading, setLoading] = useState(true);

  const theme = getEventThemeColors(event.event_type);
  const daysLeft = event.target_date ? daysUntil(event.target_date) : null;

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, b, v, g, i] = await Promise.all([
        getTimelineItems(event.id),
        getBudgetItems(event.id),
        getVendors(event.id),
        getGuests(event.id),
        getIdeas(event.id),
      ]);
      setTimeline(t);
      setBudgetItems(b);
      setVendors(v);
      setGuests(g);
      setIdeas(i);
    } catch (err) {
      console.error('Failed to load event data:', err);
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode; count?: number }> = [
    { id: 'overview', label: 'Overview', icon: <FileText className="h-4 w-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="h-4 w-4" />, count: timeline.length },
    { id: 'budget', label: 'Budget', icon: <Wallet className="h-4 w-4" />, count: budgetItems.length },
    { id: 'vendors', label: 'Vendors', icon: <Store className="h-4 w-4" />, count: vendors.length },
    { id: 'guests', label: 'Guests', icon: <Users className="h-4 w-4" />, count: guests.length },
    { id: 'ideas', label: 'AI Ideas', icon: <Lightbulb className="h-4 w-4" />, count: ideas.length },
  ];

  // Stats
  const totalEstimated = budgetItems.reduce((s, b) => s + Number(b.estimated_cost), 0);
  const totalActual = budgetItems.reduce((s, b) => s + Number(b.actual_cost), 0);
  const confirmedGuests = guests.filter((g) => g.rsvp_status === 'confirmed').length;
  const completedTasks = timeline.filter((t) => t.is_completed).length;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Event Header */}
      <div className={`rounded-2xl bg-gradient-to-br ${theme.gradient} border border-gray-100 p-6 sm:p-8 mb-6`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <Badge>{EVENT_TYPE_LABELS[event.event_type]}</Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
              {event.target_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(event.target_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {event.guest_count} guests
              </span>
              <span className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4" />
                {formatCurrency(event.total_budget)}
              </span>
              {event.location_city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {event.location_city}
                </span>
              )}
            </div>
          </div>
          {daysLeft !== null && daysLeft >= 0 && (
            <div className="text-center sm:text-right flex-shrink-0">
              <div className="text-4xl font-bold text-gray-900">{daysLeft}</div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                {daysLeft === 1 ? 'day left' : 'days left'}
              </div>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-gray-900">{formatCurrency(totalActual)}</div>
            <div className="text-xs text-gray-400">Spent</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(event.total_budget - totalActual)}
            </div>
            <div className="text-xs text-gray-400">Remaining</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-gray-900">
              {completedTasks}/{timeline.length}
            </div>
            <div className="text-xs text-gray-400">Tasks Done</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-gray-900">
              {confirmedGuests}/{guests.length}
            </div>
            <div className="text-xs text-gray-400">RSVPs</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-6 bg-white rounded-xl border border-gray-100 p-1.5 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-gray-300 animate-spin" />
        </div>
      ) : (
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <OverviewTab event={event} onEventUpdate={onEventUpdate} />
          )}
          {activeTab === 'timeline' && (
            <TimelineTab eventId={event.id} items={timeline} setItems={setTimeline} />
          )}
          {activeTab === 'budget' && (
            <BudgetTab
              eventId={event.id}
              items={budgetItems}
              setItems={setBudgetItems}
              totalBudget={event.total_budget}
            />
          )}
          {activeTab === 'vendors' && (
            <VendorsTab eventId={event.id} items={vendors} setItems={setVendors} />
          )}
          {activeTab === 'guests' && (
            <GuestsTab eventId={event.id} items={guests} setItems={setGuests} />
          )}
          {activeTab === 'ideas' && (
            <IdeasTab event={event} items={ideas} setItems={setIdeas} />
          )}
        </div>
      )}
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────────────────────

function OverviewTab({ event, onEventUpdate }: { event: Event; onEventUpdate: (e: Event) => void }) {
  const [aiChat, setAiChat] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const askAI = async () => {
    if (!aiChat.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    try {
      const ctx = `Event: ${event.title}\nType: ${event.event_type}\nGuests: ${event.guest_count}\nBudget: ₹${event.total_budget}\nDate: ${event.target_date || 'TBD'}\nLocation: ${event.location_city || 'TBD'}\nTheme: ${event.theme_vibe || 'TBD'}`;
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiChat, context: ctx }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiResponse(data.result);
    } catch (err) {
      setAiResponse('Sorry, I encountered an error. Please try again.');
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* AI summary */}
      <div className="lg:col-span-3 space-y-6">
        {event.ai_summary && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">AI Event Blueprint</h3>
            </div>
            <div className="ai-prose text-sm text-gray-600 whitespace-pre-wrap max-h-[500px] overflow-y-auto pr-2">
              {event.ai_summary}
            </div>
          </Card>
        )}

        {/* AI Chat */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Ask Lumina AI</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Ask anything about your event — budget tips, decoration ideas, venue suggestions, timeline advice...
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiChat}
              onChange={(e) => setAiChat(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askAI()}
              placeholder="e.g., Suggest 5 budget-friendly centerpiece ideas..."
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
            />
            <Button onClick={askAI} isLoading={aiLoading} icon={<Send className="h-4 w-4" />}>
              Ask
            </Button>
          </div>
          {aiResponse && (
            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100 ai-prose text-sm text-gray-600 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {aiResponse}
            </div>
          )}
        </Card>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Quick Tips</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">📋</span>
              Use the <strong>Timeline</strong> tab to track milestones
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">💰</span>
              Track estimated vs actual costs in <strong>Budget</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">🏪</span>
              Manage vendor status and contacts in <strong>Vendors</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">👥</span>
              Track RSVPs and dietary needs in <strong>Guests</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">💡</span>
              Generate creative AI ideas in the <strong>AI Ideas</strong> tab
            </li>
          </ul>
        </Card>

        {event.theme_vibe && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">Theme & Vibe</h3>
            <p className="text-sm text-gray-500 italic">&ldquo;{event.theme_vibe}&rdquo;</p>
          </Card>
        )}

        {event.notes && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-500 whitespace-pre-wrap">{event.notes}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TIMELINE TAB
// ─────────────────────────────────────────────────────────────

function TimelineTab({
  eventId,
  items,
  setItems,
}: {
  eventId: string;
  items: TimelineItem[];
  setItems: React.Dispatch<React.SetStateAction<TimelineItem[]>>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', phase: 'planning_early', priority: 'medium', time_slot: '' });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const item = await createTimelineItem({
        event_id: eventId,
        title: form.title,
        description: form.description || null,
        phase: form.phase as TimelineItem['phase'],
        priority: form.priority as TimelineItem['priority'],
        time_slot: form.time_slot || null,
        order_index: items.length,
      });
      setItems((prev) => [...prev, item]);
      setForm({ title: '', description: '', phase: 'planning_early', priority: 'medium', time_slot: '' });
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (item: TimelineItem) => {
    try {
      const updated = await updateTimelineItem(item.id, { is_completed: !item.is_completed });
      setItems((prev) => prev.map((t) => (t.id === item.id ? updated : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTimelineItem(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const phases = ['planning_early', 'planning_mid', 'final_weeks', 'day_of'] as const;
  const completedCount = items.filter((t) => t.is_completed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Event Timeline</h2>
          <p className="text-sm text-gray-400">
            {completedCount}/{items.length} milestones completed
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} icon={<Plus className="h-4 w-4" />} variant={showAdd ? 'ghost' : 'primary'}>
          {showAdd ? 'Cancel' : 'Add Milestone'}
        </Button>
      </div>

      {items.length > 0 && (
        <ProgressBar
          value={completedCount}
          max={items.length}
          colorClass="bg-emerald-500"
        />
      )}

      {showAdd && (
        <Card className="animate-fade-in border-2 border-dashed border-gray-200">
          <div className="space-y-4">
            <Input label="Task Title" placeholder="e.g., Book venue" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea label="Description (optional)" rows={2} placeholder="More details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <Select
                label="Phase"
                value={form.phase}
                onChange={(e) => setForm({ ...form, phase: e.target.value })}
                options={phases.map((p) => ({ value: p, label: PHASE_LABELS[p].label }))}
              />
              <Select
                label="Priority"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' },
                ]}
              />
              <Input label="Time Slot" placeholder="e.g., 2:00 PM" value={form.time_slot} onChange={(e) => setForm({ ...form, time_slot: e.target.value })} />
            </div>
            <Button onClick={handleAdd} isLoading={saving} icon={<Plus className="h-4 w-4" />}>
              Add Milestone
            </Button>
          </div>
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-14 w-14" />}
          title="No milestones yet"
          description="Add your first timeline milestone or let AI generate one for you."
          action={<Button onClick={() => setShowAdd(true)} icon={<Plus className="h-4 w-4" />}>Add First Milestone</Button>}
        />
      ) : (
        <div className="space-y-6">
          {phases.map((phase) => {
            const phaseItems = items.filter((t) => t.phase === phase);
            if (phaseItems.length === 0) return null;
            const config = PHASE_LABELS[phase];
            return (
              <div key={phase}>
                <div className="flex items-center gap-2 mb-3">
                  <span>{config.icon}</span>
                  <h3 className="font-semibold text-gray-800">{config.label}</h3>
                  <span className="text-xs text-gray-400">({phaseItems.length})</span>
                </div>
                <div className="space-y-2 ml-6 border-l-2 border-gray-100 pl-4">
                  {phaseItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                        item.is_completed ? 'bg-gray-50 opacity-60' : 'bg-white border border-gray-100'
                      }`}
                    >
                      <button
                        onClick={() => toggleComplete(item)}
                        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          item.is_completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {item.is_completed && <Check className="h-3 w-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${item.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {item.time_slot && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {item.time_slot}
                            </span>
                          )}
                          {item.priority === 'high' && <Badge color="text-orange-700" bg="bg-orange-100">High</Badge>}
                          {item.priority === 'critical' && <Badge color="text-red-700" bg="bg-red-100">Critical</Badge>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BUDGET TAB
// ─────────────────────────────────────────────────────────────

function BudgetTab({
  eventId,
  items,
  setItems,
  totalBudget,
}: {
  eventId: string;
  items: BudgetItem[];
  setItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  totalBudget: number;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: BUDGET_CATEGORIES[0] as string, item_name: '', estimated_cost: '', actual_cost: '' });
  const [saving, setSaving] = useState(false);

  const totalEstimated = items.reduce((s, b) => s + Number(b.estimated_cost), 0);
  const totalActual = items.reduce((s, b) => s + Number(b.actual_cost), 0);
  const budgetUsedPercent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  const handleAdd = async () => {
    if (!form.item_name.trim()) return;
    setSaving(true);
    try {
      const item = await createBudgetItem({
        event_id: eventId,
        category: form.category,
        item_name: form.item_name,
        estimated_cost: parseFloat(form.estimated_cost) || 0,
        actual_cost: parseFloat(form.actual_cost) || 0,
      });
      setItems((prev) => [...prev, item]);
      setForm({ category: BUDGET_CATEGORIES[0], item_name: '', estimated_cost: '', actual_cost: '' });
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePaid = async (item: BudgetItem) => {
    try {
      const updated = await updateBudgetItem(item.id, { is_paid: !item.is_paid });
      setItems((prev) => prev.map((b) => (b.id === item.id ? updated : b)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudgetItem(id);
      setItems((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Group by category
  const grouped = items.reduce<Record<string, BudgetItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Budget Tracker</h2>
          <p className="text-sm text-gray-400">
            {formatCurrency(totalActual)} spent of {formatCurrency(totalBudget)} budget
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} icon={<Plus className="h-4 w-4" />} variant={showAdd ? 'ghost' : 'primary'}>
          {showAdd ? 'Cancel' : 'Add Item'}
        </Button>
      </div>

      {/* Budget summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card padding="sm" className="text-center">
          <div className="text-xs text-gray-400 mb-1">Total Budget</div>
          <div className="text-lg font-bold text-gray-900">{formatCurrency(totalBudget)}</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-xs text-gray-400 mb-1">Estimated</div>
          <div className={`text-lg font-bold ${totalEstimated > totalBudget ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(totalEstimated)}
          </div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-xs text-gray-400 mb-1">Spent</div>
          <div className="text-lg font-bold text-gray-900">{formatCurrency(totalActual)}</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-xs text-gray-400 mb-1">Remaining</div>
          <div className={`text-lg font-bold ${totalBudget - totalActual < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {formatCurrency(totalBudget - totalActual)}
          </div>
        </Card>
      </div>

      <ProgressBar value={totalActual} max={totalBudget} colorClass={getProgressColor(budgetUsedPercent)} />

      {showAdd && (
        <Card className="animate-fade-in border-2 border-dashed border-gray-200">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                options={BUDGET_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
              <Input label="Item Name" placeholder="e.g., Main course catering" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Estimated Cost (₹)" type="number" placeholder="0" value={form.estimated_cost} onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })} />
              <Input label="Actual Cost (₹)" type="number" placeholder="0" value={form.actual_cost} onChange={(e) => setForm({ ...form, actual_cost: e.target.value })} />
            </div>
            <Button onClick={handleAdd} isLoading={saving} icon={<Plus className="h-4 w-4" />}>Add Budget Item</Button>
          </div>
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<Wallet className="h-14 w-14" />}
          title="No budget items yet"
          description="Start tracking your event expenses by category."
          action={<Button onClick={() => setShowAdd(true)} icon={<Plus className="h-4 w-4" />}>Add First Item</Button>}
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, catItems]) => {
            const catEstimated = catItems.reduce((s, b) => s + Number(b.estimated_cost), 0);
            const catActual = catItems.reduce((s, b) => s + Number(b.actual_cost), 0);
            return (
              <Card key={category} padding="sm">
                <div className="flex items-center justify-between p-2 mb-2">
                  <h4 className="font-semibold text-gray-800 text-sm">{category}</h4>
                  <div className="text-xs text-gray-400">
                    {formatCurrency(catActual)} / {formatCurrency(catEstimated)}
                  </div>
                </div>
                <div className="space-y-1">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <button
                        onClick={() => handleTogglePaid(item)}
                        className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          item.is_paid ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {item.is_paid && <Check className="h-3 w-3" />}
                      </button>
                      <span className={`flex-1 text-sm ${item.is_paid ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {item.item_name}
                      </span>
                      <span className="text-xs text-gray-400">{formatCurrency(Number(item.estimated_cost))}</span>
                      <span className="text-xs font-medium text-gray-700">{formatCurrency(Number(item.actual_cost))}</span>
                      <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VENDORS TAB
// ─────────────────────────────────────────────────────────────

function VendorsTab({
  eventId,
  items,
  setItems,
}: {
  eventId: string;
  items: Vendor[];
  setItems: React.Dispatch<React.SetStateAction<Vendor[]>>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: VENDOR_CATEGORIES[0] as string, vendor_name: '', contact_person: '', email: '', phone: '', price_quote: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.vendor_name.trim()) return;
    setSaving(true);
    try {
      const vendor = await createVendor({
        event_id: eventId,
        category: form.category,
        vendor_name: form.vendor_name,
        contact_person: form.contact_person || null,
        email: form.email || null,
        phone: form.phone || null,
        price_quote: parseFloat(form.price_quote) || 0,
        notes: form.notes || null,
      });
      setItems((prev) => [...prev, vendor]);
      setForm({ category: VENDOR_CATEGORIES[0] as string, vendor_name: '', contact_person: '', email: '', phone: '', price_quote: '', notes: '' });
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (vendor: Vendor, newStatus: string) => {
    try {
      const updated = await updateVendor(vendor.id, { status: newStatus as Vendor['status'] });
      setItems((prev) => prev.map((v) => (v.id === vendor.id ? updated : v)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVendor(id);
      setItems((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vendor Hub</h2>
          <p className="text-sm text-gray-400">{items.length} vendors tracked</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} icon={<Plus className="h-4 w-4" />} variant={showAdd ? 'ghost' : 'primary'}>
          {showAdd ? 'Cancel' : 'Add Vendor'}
        </Button>
      </div>

      {showAdd && (
        <Card className="animate-fade-in border-2 border-dashed border-gray-200">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={VENDOR_CATEGORIES.map((c) => ({ value: c, label: c }))} />
              <Input label="Vendor Name" placeholder="e.g., Sharma Catering" value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Contact Person" placeholder="Name" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
              <Input label="Email" type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Phone" type="tel" placeholder="+91..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Price Quote (₹)" type="number" placeholder="0" value={form.price_quote} onChange={(e) => setForm({ ...form, price_quote: e.target.value })} />
              <Input label="Notes" placeholder="Any notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <Button onClick={handleAdd} isLoading={saving} icon={<Plus className="h-4 w-4" />}>Add Vendor</Button>
          </div>
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<Store className="h-14 w-14" />}
          title="No vendors yet"
          description="Start tracking your vendors — caterers, photographers, decorators and more."
          action={<Button onClick={() => setShowAdd(true)} icon={<Plus className="h-4 w-4" />}>Add First Vendor</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((vendor) => {
            const statusConfig = VENDOR_STATUS_CONFIG[vendor.status] || VENDOR_STATUS_CONFIG.researching;
            return (
              <Card key={vendor.id} hover>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{vendor.vendor_name}</span>
                      <Badge color={statusConfig.color} bg={statusConfig.bg}>{statusConfig.label}</Badge>
                    </div>
                    <span className="text-xs text-gray-400">{vendor.category}</span>
                  </div>
                  <button onClick={() => handleDelete(vendor.id)} className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {(vendor.contact_person || vendor.email || vendor.phone) && (
                  <div className="text-xs text-gray-500 space-y-0.5 mb-3">
                    {vendor.contact_person && <p>👤 {vendor.contact_person}</p>}
                    {vendor.email && <p>📧 {vendor.email}</p>}
                    {vendor.phone && <p>📞 {vendor.phone}</p>}
                  </div>
                )}

                {Number(vendor.price_quote) > 0 && (
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Quote: {formatCurrency(Number(vendor.price_quote))}
                  </p>
                )}

                {vendor.notes && (
                  <p className="text-xs text-gray-400 mb-3">{vendor.notes}</p>
                )}

                {/* Status progression buttons */}
                <div className="flex gap-1.5">
                  {(['researching', 'contacted', 'contract_signed', 'paid'] as const).map((s) => {
                    const cfg = VENDOR_STATUS_CONFIG[s];
                    const isActive = s === vendor.status;
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(vendor, s)}
                        className={`flex-1 text-xs py-1.5 rounded-lg transition-colors font-medium ${
                          isActive
                            ? `${cfg.bg} ${cfg.color}`
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GUESTS TAB
// ─────────────────────────────────────────────────────────────

function GuestsTab({
  eventId,
  items,
  setItems,
}: {
  eventId: string;
  items: Guest[];
  setItems: React.Dispatch<React.SetStateAction<Guest[]>>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', dietary_restrictions: '', group_or_table: '', plus_ones: '0' });
  const [saving, setSaving] = useState(false);

  const confirmed = items.filter((g) => g.rsvp_status === 'confirmed').length;
  const declined = items.filter((g) => g.rsvp_status === 'declined').length;
  const pending = items.filter((g) => g.rsvp_status === 'pending').length;
  const totalPlusOnes = items.reduce((s, g) => s + (g.plus_ones || 0), 0);

  const handleAdd = async () => {
    if (!form.full_name.trim()) return;
    setSaving(true);
    try {
      const guest = await createGuest({
        event_id: eventId,
        full_name: form.full_name,
        email: form.email || null,
        dietary_restrictions: form.dietary_restrictions || null,
        group_or_table: form.group_or_table || null,
        plus_ones: parseInt(form.plus_ones) || 0,
      });
      setItems((prev) => [...prev, guest].sort((a, b) => a.full_name.localeCompare(b.full_name)));
      setForm({ full_name: '', email: '', dietary_restrictions: '', group_or_table: '', plus_ones: '0' });
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateRSVP = async (guest: Guest, status: string) => {
    try {
      const updated = await updateGuest(guest.id, { rsvp_status: status as Guest['rsvp_status'] });
      setItems((prev) => prev.map((g) => (g.id === guest.id ? updated : g)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGuest(id);
      setItems((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Guest List</h2>
          <p className="text-sm text-gray-400">
            {items.length} guests{totalPlusOnes > 0 ? ` + ${totalPlusOnes} plus-ones` : ''}
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} icon={<UserPlus className="h-4 w-4" />} variant={showAdd ? 'ghost' : 'primary'}>
          {showAdd ? 'Cancel' : 'Add Guest'}
        </Button>
      </div>

      {/* RSVP summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{confirmed}</div>
          <div className="text-xs text-gray-400">Confirmed</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-amber-600">{pending}</div>
          <div className="text-xs text-gray-400">Pending</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-red-500">{declined}</div>
          <div className="text-xs text-gray-400">Declined</div>
        </Card>
      </div>

      {showAdd && (
        <Card className="animate-fade-in border-2 border-dashed border-gray-200">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Full Name" placeholder="Guest name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              <Input label="Email" type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Dietary Restrictions" placeholder="e.g., Vegan" value={form.dietary_restrictions} onChange={(e) => setForm({ ...form, dietary_restrictions: e.target.value })} />
              <Input label="Group / Table" placeholder="e.g., Family" value={form.group_or_table} onChange={(e) => setForm({ ...form, group_or_table: e.target.value })} />
              <Input label="Plus Ones" type="number" min={0} value={form.plus_ones} onChange={(e) => setForm({ ...form, plus_ones: e.target.value })} />
            </div>
            <Button onClick={handleAdd} isLoading={saving} icon={<UserPlus className="h-4 w-4" />}>Add Guest</Button>
          </div>
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<Users className="h-14 w-14" />}
          title="No guests yet"
          description="Start building your guest list."
          action={<Button onClick={() => setShowAdd(true)} icon={<UserPlus className="h-4 w-4" />}>Add First Guest</Button>}
        />
      ) : (
        <Card padding="none">
          <div className="divide-y divide-gray-50">
            {items.map((guest) => {
              const rsvpConfig = RSVP_CONFIG[guest.rsvp_status] || RSVP_CONFIG.pending;
              return (
                <div key={guest.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                    {guest.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 truncate">{guest.full_name}</span>
                      {guest.plus_ones > 0 && (
                        <span className="text-xs text-gray-400">+{guest.plus_ones}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {guest.email && <span>{guest.email}</span>}
                      {guest.dietary_restrictions && <span>• {guest.dietary_restrictions}</span>}
                      {guest.group_or_table && <span>• {guest.group_or_table}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(['confirmed', 'pending', 'declined'] as const).map((s) => {
                      const cfg = RSVP_CONFIG[s];
                      const isActive = s === guest.rsvp_status;
                      return (
                        <button
                          key={s}
                          onClick={() => updateRSVP(guest, s)}
                          className={`text-xs px-2.5 py-1 rounded-lg transition-colors font-medium ${
                            isActive ? `${cfg.bg} ${cfg.color}` : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => handleDelete(guest.id)} className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AI IDEAS TAB
// ─────────────────────────────────────────────────────────────

function IdeasTab({
  event,
  items,
  setItems,
}: {
  event: Event;
  items: IdeaAndMood[];
  setItems: React.Dispatch<React.SetStateAction<IdeaAndMood[]>>;
}) {
  const [generating, setGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('decor');

  const ideaCategories = [
    { value: 'decor', label: '🎨 Decor Ideas', prompt: 'unique decoration and styling ideas' },
    { value: 'food', label: '🍽️ Food & Menu', prompt: 'creative food, menu, and signature dish ideas' },
    { value: 'cocktail_menu', label: '🍸 Drinks', prompt: 'creative cocktail, mocktail, and beverage ideas' },
    { value: 'music', label: '🎵 Music & Entertainment', prompt: 'music playlists, entertainment acts, and activity ideas' },
    { value: 'invitation', label: '💌 Invitation Wording', prompt: 'creative, personalized invitation text and wording ideas' },
    { value: 'activity', label: '🎮 Activities & Games', prompt: 'fun interactive activities, games, and ice-breaker ideas' },
    { value: 'theme', label: '🎭 Theme Concepts', prompt: 'overall theme concepts and color palette ideas' },
  ];

  const generateIdeas = async () => {
    const cat = ideaCategories.find((c) => c.value === selectedCategory);
    if (!cat) return;

    setGenerating(true);
    try {
      const ctx = `Event: ${event.title}\nType: ${event.event_type}\nGuests: ${event.guest_count}\nBudget: ₹${event.total_budget}\nTheme: ${event.theme_vibe || 'Open to suggestions'}\nLocation: ${event.location_city || 'TBD'}`;

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate 5 creative and specific ${cat.prompt} for this event. For each idea, provide:
          - A catchy title (short, 3-5 words)
          - A detailed description (2-3 sentences explaining the idea, how to execute it, and estimated cost range)
          
          Format each idea as:
          TITLE: [title]
          DESCRIPTION: [description]
          
          Make the ideas unique, practical, and budget-appropriate.`,
          context: ctx,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Parse the AI response into individual ideas
      const text = data.result as string;
      const ideaBlocks = text.split(/(?=TITLE:)/g).filter((block: string) => block.trim().startsWith('TITLE:'));

      for (const block of ideaBlocks) {
        const titleMatch = block.match(/TITLE:\s*(.+?)(?:\n|$)/);
        const descMatch = block.match(/DESCRIPTION:\s*([\s\S]+?)(?=(?:TITLE:|$))/);

        if (titleMatch && descMatch) {
          const idea = await createIdea({
            event_id: event.id,
            category: selectedCategory as IdeaAndMood['category'],
            title: titleMatch[1].trim().replace(/^\*+|\*+$/g, ''),
            description: descMatch[1].trim().replace(/^\*+|\*+$/g, ''),
            tags: [],
          });
          setItems((prev) => [idea, ...prev]);
        }
      }
    } catch (err) {
      console.error('Failed to generate ideas:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIdea(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">AI Creative Studio</h2>
        <p className="text-sm text-gray-400">Generate personalized ideas tailored to your event</p>
      </div>

      {/* Idea generator */}
      <Card className="bg-gradient-to-br from-gray-50 to-stone-50">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Generate New Ideas</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {ideaCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <Button
          onClick={generateIdeas}
          isLoading={generating}
          icon={<Sparkles className="h-4 w-4" />}
          size="lg"
        >
          {generating ? 'Generating Ideas...' : 'Generate 5 Ideas'}
        </Button>
      </Card>

      {/* Ideas list */}
      {items.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="h-14 w-14" />}
          title="No ideas yet"
          description="Generate some AI-powered creative ideas for your event."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((idea, i) => {
            const catLabel = ideaCategories.find((c) => c.value === idea.category)?.label || idea.category;
            return (
              <div
                key={idea.id}
                className="animate-fade-in opacity-0"
                style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'forwards' }}
              >
                <Card hover>
                  <div className="flex items-start justify-between mb-2">
                    <Badge>{catLabel}</Badge>
                    <button onClick={() => handleDelete(idea.id)} className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1.5">{idea.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{idea.description}</p>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

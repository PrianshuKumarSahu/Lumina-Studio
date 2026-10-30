import { supabase } from './supabase';
import type { Event, TimelineItem, BudgetItem, Vendor, IdeaAndMood, Guest } from './types';

// Helper to generate UUIDs in the browser or Node
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
}

// LocalStorage persistence helpers for seamless offline/pre-database experience
function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

// ============================================================
// EVENTS
// ============================================================

export async function getEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Keep local storage in sync
      setLocal('fetecraft_events', data);
      return data;
    }
  } catch (e) {
    console.warn('Supabase query failed, using local storage fallback:', e);
  }

  // Fallback to local storage
  return getLocal<Event[]>('fetecraft_events', []);
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      return data;
    }
  } catch (e) {
    console.warn('Supabase getEvent failed, checking local storage:', e);
  }

  const localEvents = getLocal<Event[]>('fetecraft_events', []);
  return localEvents.find((e) => e.id === id) || null;
}

export async function createEvent(event: Partial<Event>): Promise<Event> {
  const newEvent: Event = {
    id: event.id || generateId(),
    title: event.title || 'Untitled Event',
    event_type: event.event_type || 'wedding',
    theme_vibe: event.theme_vibe || null,
    target_date: event.target_date || null,
    guest_count: event.guest_count || 50,
    total_budget: event.total_budget || 50000,
    location_city: event.location_city || null,
    notes: event.notes || null,
    ai_summary: event.ai_summary || null,
    color_palette: event.color_palette || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('events')
      .insert(newEvent)
      .select()
      .single();

    if (!error && data) {
      // Also save locally
      const localEvents = getLocal<Event[]>('fetecraft_events', []);
      setLocal('fetecraft_events', [data, ...localEvents]);
      return data;
    }
  } catch (e) {
    console.warn('Supabase createEvent failed, using local storage fallback:', e);
  }

  // Fallback to local storage
  const localEvents = getLocal<Event[]>('fetecraft_events', []);
  const updated = [newEvent, ...localEvents];
  setLocal('fetecraft_events', updated);

  // Auto-seed starter timeline & budget for an amazing out-of-the-box experience
  seedStarterItems(newEvent.id, newEvent.event_type, newEvent.total_budget);

  return newEvent;
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
  const now = new Date().toISOString();
  try {
    const { data, error } = await supabase
      .from('events')
      .update({ ...updates, updated_at: now })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      const localEvents = getLocal<Event[]>('fetecraft_events', []);
      setLocal(
        'fetecraft_events',
        localEvents.map((e) => (e.id === id ? data : e))
      );
      return data;
    }
  } catch (e) {
    console.warn('Supabase updateEvent failed, updating local storage:', e);
  }

  const localEvents = getLocal<Event[]>('fetecraft_events', []);
  const existing = localEvents.find((e) => e.id === id);
  const updatedEvent = { ...existing, ...updates, updated_at: now } as Event;
  setLocal(
    'fetecraft_events',
    localEvents.map((e) => (e.id === id ? updatedEvent : e))
  );
  return updatedEvent;
}

export async function deleteEvent(id: string): Promise<void> {
  try {
    await supabase.from('events').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase deleteEvent error:', e);
  }

  const localEvents = getLocal<Event[]>('fetecraft_events', []);
  setLocal(
    'fetecraft_events',
    localEvents.filter((e) => e.id !== id)
  );
}

// ============================================================
// TIMELINE ITEMS
// ============================================================

export async function getTimelineItems(eventId: string): Promise<TimelineItem[]> {
  try {
    const { data, error } = await supabase
      .from('timeline_items')
      .select('*')
      .eq('event_id', eventId)
      .order('order_index', { ascending: true });

    if (!error && data) {
      return data;
    }
  } catch (e) {
    console.warn('Supabase timeline fetch error:', e);
  }

  const allTimeline = getLocal<TimelineItem[]>('fetecraft_timeline', []);
  return allTimeline.filter((t) => t.event_id === eventId);
}

export async function createTimelineItem(item: Partial<TimelineItem>): Promise<TimelineItem> {
  const newItem: TimelineItem = {
    id: item.id || generateId(),
    event_id: item.event_id!,
    phase: item.phase || 'planning_early',
    title: item.title || 'Untitled milestone',
    description: item.description || null,
    time_slot: item.time_slot || null,
    due_date: item.due_date || null,
    is_completed: item.is_completed || false,
    category: item.category || 'logistics',
    priority: item.priority || 'medium',
    order_index: item.order_index || 0,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('timeline_items')
      .insert(newItem)
      .select()
      .single();

    if (!error && data) {
      const all = getLocal<TimelineItem[]>('fetecraft_timeline', []);
      setLocal('fetecraft_timeline', [...all, data]);
      return data;
    }
  } catch (e) {
    console.warn('Supabase createTimelineItem error:', e);
  }

  const all = getLocal<TimelineItem[]>('fetecraft_timeline', []);
  setLocal('fetecraft_timeline', [...all, newItem]);
  return newItem;
}

export async function updateTimelineItem(id: string, updates: Partial<TimelineItem>): Promise<TimelineItem> {
  try {
    const { data, error } = await supabase
      .from('timeline_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      const all = getLocal<TimelineItem[]>('fetecraft_timeline', []);
      setLocal(
        'fetecraft_timeline',
        all.map((t) => (t.id === id ? data : t))
      );
      return data;
    }
  } catch (e) {
    console.warn('Supabase updateTimelineItem error:', e);
  }

  const all = getLocal<TimelineItem[]>('fetecraft_timeline', []);
  const existing = all.find((t) => t.id === id);
  const updated = { ...existing, ...updates } as TimelineItem;
  setLocal(
    'fetecraft_timeline',
    all.map((t) => (t.id === id ? updated : t))
  );
  return updated;
}

export async function deleteTimelineItem(id: string): Promise<void> {
  try {
    await supabase.from('timeline_items').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase deleteTimelineItem error:', e);
  }

  const all = getLocal<TimelineItem[]>('fetecraft_timeline', []);
  setLocal(
    'fetecraft_timeline',
    all.filter((t) => t.id !== id)
  );
}

// ============================================================
// BUDGET ITEMS
// ============================================================

export async function getBudgetItems(eventId: string): Promise<BudgetItem[]> {
  try {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      return data;
    }
  } catch (e) {
    console.warn('Supabase budget fetch error:', e);
  }

  const all = getLocal<BudgetItem[]>('fetecraft_budget', []);
  return all.filter((b) => b.event_id === eventId);
}

export async function createBudgetItem(item: Partial<BudgetItem>): Promise<BudgetItem> {
  const newItem: BudgetItem = {
    id: item.id || generateId(),
    event_id: item.event_id!,
    category: item.category || 'Venue',
    item_name: item.item_name || 'Expense item',
    estimated_cost: item.estimated_cost || 0,
    actual_cost: item.actual_cost || 0,
    is_paid: item.is_paid || false,
    notes: item.notes || null,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('budget_items')
      .insert(newItem)
      .select()
      .single();

    if (!error && data) {
      const all = getLocal<BudgetItem[]>('fetecraft_budget', []);
      setLocal('fetecraft_budget', [...all, data]);
      return data;
    }
  } catch (e) {
    console.warn('Supabase createBudgetItem error:', e);
  }

  const all = getLocal<BudgetItem[]>('fetecraft_budget', []);
  setLocal('fetecraft_budget', [...all, newItem]);
  return newItem;
}

export async function updateBudgetItem(id: string, updates: Partial<BudgetItem>): Promise<BudgetItem> {
  try {
    const { data, error } = await supabase
      .from('budget_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      const all = getLocal<BudgetItem[]>('fetecraft_budget', []);
      setLocal(
        'fetecraft_budget',
        all.map((b) => (b.id === id ? data : b))
      );
      return data;
    }
  } catch (e) {
    console.warn('Supabase updateBudgetItem error:', e);
  }

  const all = getLocal<BudgetItem[]>('fetecraft_budget', []);
  const existing = all.find((b) => b.id === id);
  const updated = { ...existing, ...updates } as BudgetItem;
  setLocal(
    'fetecraft_budget',
    all.map((b) => (b.id === id ? updated : b))
  );
  return updated;
}

export async function deleteBudgetItem(id: string): Promise<void> {
  try {
    await supabase.from('budget_items').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase deleteBudgetItem error:', e);
  }

  const all = getLocal<BudgetItem[]>('fetecraft_budget', []);
  setLocal(
    'fetecraft_budget',
    all.filter((b) => b.id !== id)
  );
}

// ============================================================
// VENDORS
// ============================================================

export async function getVendors(eventId: string): Promise<Vendor[]> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      return data;
    }
  } catch (e) {
    console.warn('Supabase vendors fetch error:', e);
  }

  const all = getLocal<Vendor[]>('fetecraft_vendors', []);
  return all.filter((v) => v.event_id === eventId);
}

export async function createVendor(vendor: Partial<Vendor>): Promise<Vendor> {
  const newVendor: Vendor = {
    id: vendor.id || generateId(),
    event_id: vendor.event_id!,
    category: vendor.category || 'Other',
    vendor_name: vendor.vendor_name || 'New Vendor',
    contact_person: vendor.contact_person || null,
    email: vendor.email || null,
    phone: vendor.phone || null,
    price_quote: vendor.price_quote || 0,
    status: vendor.status || 'researching',
    notes: vendor.notes || null,
    ai_negotiation_tip: vendor.ai_negotiation_tip || null,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('vendors')
      .insert(newVendor)
      .select()
      .single();

    if (!error && data) {
      const all = getLocal<Vendor[]>('fetecraft_vendors', []);
      setLocal('fetecraft_vendors', [...all, data]);
      return data;
    }
  } catch (e) {
    console.warn('Supabase createVendor error:', e);
  }

  const all = getLocal<Vendor[]>('fetecraft_vendors', []);
  setLocal('fetecraft_vendors', [...all, newVendor]);
  return newVendor;
}

export async function updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      const all = getLocal<Vendor[]>('fetecraft_vendors', []);
      setLocal(
        'fetecraft_vendors',
        all.map((v) => (v.id === id ? data : v))
      );
      return data;
    }
  } catch (e) {
    console.warn('Supabase updateVendor error:', e);
  }

  const all = getLocal<Vendor[]>('fetecraft_vendors', []);
  const existing = all.find((v) => v.id === id);
  const updated = { ...existing, ...updates } as Vendor;
  setLocal(
    'fetecraft_vendors',
    all.map((v) => (v.id === id ? updated : v))
  );
  return updated;
}

export async function deleteVendor(id: string): Promise<void> {
  try {
    await supabase.from('vendors').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase deleteVendor error:', e);
  }

  const all = getLocal<Vendor[]>('fetecraft_vendors', []);
  setLocal(
    'fetecraft_vendors',
    all.filter((v) => v.id !== id)
  );
}

// ============================================================
// IDEAS & MOODBOARD
// ============================================================

export async function getIdeas(eventId: string): Promise<IdeaAndMood[]> {
  try {
    const { data, error } = await supabase
      .from('ideas_and_mood')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data;
    }
  } catch (e) {
    console.warn('Supabase ideas fetch error:', e);
  }

  const all = getLocal<IdeaAndMood[]>('fetecraft_ideas', []);
  return all.filter((i) => i.event_id === eventId);
}

export async function createIdea(idea: Partial<IdeaAndMood>): Promise<IdeaAndMood> {
  const newIdea: IdeaAndMood = {
    id: idea.id || generateId(),
    event_id: idea.event_id!,
    category: idea.category || 'decor',
    title: idea.title || 'Creative Idea',
    description: idea.description || '',
    tags: idea.tags || [],
    is_saved: idea.is_saved ?? true,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('ideas_and_mood')
      .insert(newIdea)
      .select()
      .single();

    if (!error && data) {
      const all = getLocal<IdeaAndMood[]>('fetecraft_ideas', []);
      setLocal('fetecraft_ideas', [data, ...all]);
      return data;
    }
  } catch (e) {
    console.warn('Supabase createIdea error:', e);
  }

  const all = getLocal<IdeaAndMood[]>('fetecraft_ideas', []);
  setLocal('fetecraft_ideas', [newIdea, ...all]);
  return newIdea;
}

export async function deleteIdea(id: string): Promise<void> {
  try {
    await supabase.from('ideas_and_mood').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase deleteIdea error:', e);
  }

  const all = getLocal<IdeaAndMood[]>('fetecraft_ideas', []);
  setLocal(
    'fetecraft_ideas',
    all.filter((i) => i.id !== id)
  );
}

// ============================================================
// GUESTS
// ============================================================

export async function getGuests(eventId: string): Promise<Guest[]> {
  try {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .order('full_name', { ascending: true });

    if (!error && data) {
      return data;
    }
  } catch (e) {
    console.warn('Supabase guests fetch error:', e);
  }

  const all = getLocal<Guest[]>('fetecraft_guests', []);
  return all.filter((g) => g.event_id === eventId);
}

export async function createGuest(guest: Partial<Guest>): Promise<Guest> {
  const newGuest: Guest = {
    id: guest.id || generateId(),
    event_id: guest.event_id!,
    full_name: guest.full_name || 'Guest',
    email: guest.email || null,
    rsvp_status: guest.rsvp_status || 'pending',
    dietary_restrictions: guest.dietary_restrictions || null,
    group_or_table: guest.group_or_table || null,
    plus_ones: guest.plus_ones || 0,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('guests')
      .insert(newGuest)
      .select()
      .single();

    if (!error && data) {
      const all = getLocal<Guest[]>('fetecraft_guests', []);
      setLocal('fetecraft_guests', [...all, data]);
      return data;
    }
  } catch (e) {
    console.warn('Supabase createGuest error:', e);
  }

  const all = getLocal<Guest[]>('fetecraft_guests', []);
  setLocal('fetecraft_guests', [...all, newGuest]);
  return newGuest;
}

export async function updateGuest(id: string, updates: Partial<Guest>): Promise<Guest> {
  try {
    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      const all = getLocal<Guest[]>('fetecraft_guests', []);
      setLocal(
        'fetecraft_guests',
        all.map((g) => (g.id === id ? data : g))
      );
      return data;
    }
  } catch (e) {
    console.warn('Supabase updateGuest error:', e);
  }

  const all = getLocal<Guest[]>('fetecraft_guests', []);
  const existing = all.find((g) => g.id === id);
  const updated = { ...existing, ...updates } as Guest;
  setLocal(
    'fetecraft_guests',
    all.map((g) => (g.id === id ? updated : g))
  );
  return updated;
}

export async function deleteGuest(id: string): Promise<void> {
  try {
    await supabase.from('guests').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase deleteGuest error:', e);
  }

  const all = getLocal<Guest[]>('fetecraft_guests', []);
  setLocal(
    'fetecraft_guests',
    all.filter((g) => g.id !== id)
  );
}

// ============================================================
// SEED STARTER ITEMS FOR NEW EVENTS
// ============================================================

function seedStarterItems(eventId: string, eventType: string, budget: number): void {
  // Timeline items
  const starterTimeline: TimelineItem[] = [
    {
      id: generateId(),
      event_id: eventId,
      phase: 'planning_early',
      title: 'Lock Venue & Date',
      description: 'Review contracts and secure deposit with the venue manager',
      time_slot: null,
      due_date: null,
      is_completed: false,
      category: 'logistics',
      priority: 'high',
      order_index: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      event_id: eventId,
      phase: 'planning_mid',
      title: 'Book Catering & Bar Service',
      description: 'Conduct food tasting and confirm dietary options',
      time_slot: null,
      due_date: null,
      is_completed: false,
      category: 'logistics',
      priority: 'high',
      order_index: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      event_id: eventId,
      phase: 'final_weeks',
      title: 'Confirm Final Guest Headcount',
      description: 'Lock numbers with venue and caterers',
      time_slot: null,
      due_date: null,
      is_completed: false,
      category: 'guest',
      priority: 'critical',
      order_index: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      event_id: eventId,
      phase: 'day_of',
      title: 'Doors Open & Welcome Drinks',
      description: 'Acoustic background music and signature welcome beverages',
      time_slot: '05:00 PM',
      due_date: null,
      is_completed: false,
      category: 'logistics',
      priority: 'medium',
      order_index: 3,
      created_at: new Date().toISOString(),
    },
  ];

  const allTimeline = getLocal<TimelineItem[]>('fetecraft_timeline', []);
  setLocal('fetecraft_timeline', [...allTimeline, ...starterTimeline]);

  // Budget items
  const starterBudget: BudgetItem[] = [
    {
      id: generateId(),
      event_id: eventId,
      category: 'Venue',
      item_name: 'Main Space & Hall Rental',
      estimated_cost: Math.round(budget * 0.35),
      actual_cost: 0,
      is_paid: false,
      notes: 'Includes tables and chairs',
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      event_id: eventId,
      category: 'Catering & Food',
      item_name: 'Buffet & Appetizers',
      estimated_cost: Math.round(budget * 0.30),
      actual_cost: 0,
      is_paid: false,
      notes: 'Welcome drinks + main course',
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      event_id: eventId,
      category: 'Photography & Video',
      item_name: 'Lead Photographer',
      estimated_cost: Math.round(budget * 0.15),
      actual_cost: 0,
      is_paid: false,
      notes: '6 hours coverage',
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      event_id: eventId,
      category: 'Decorations & Flowers',
      item_name: 'Focal Stage & Entrance Decor',
      estimated_cost: Math.round(budget * 0.12),
      actual_cost: 0,
      is_paid: false,
      notes: 'Floral arrangement & ambient lighting',
      created_at: new Date().toISOString(),
    },
  ];

  const allBudget = getLocal<BudgetItem[]>('fetecraft_budget', []);
  setLocal('fetecraft_budget', [...allBudget, ...starterBudget]);
}

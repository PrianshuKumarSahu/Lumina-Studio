export interface Event {
  id: string;
  title: string;
  event_type: 'wedding' | 'birthday' | 'community' | 'corporate' | 'anniversary' | 'baby_shower';
  theme_vibe: string | null;
  target_date: string | null;
  guest_count: number;
  total_budget: number;
  location_city: string | null;
  notes: string | null;
  ai_summary: string | null;
  color_palette: string[];
  created_at: string;
  updated_at: string;
}

export interface TimelineItem {
  id: string;
  event_id: string;
  phase: 'planning_early' | 'planning_mid' | 'final_weeks' | 'day_of';
  title: string;
  description: string | null;
  time_slot: string | null;
  due_date: string | null;
  is_completed: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  order_index: number;
  created_at: string;
}

export interface BudgetItem {
  id: string;
  event_id: string;
  category: string;
  item_name: string;
  estimated_cost: number;
  actual_cost: number;
  is_paid: boolean;
  notes: string | null;
  created_at: string;
}

export interface Vendor {
  id: string;
  event_id: string;
  category: string;
  vendor_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  price_quote: number;
  status: 'researching' | 'contacted' | 'contract_signed' | 'paid';
  notes: string | null;
  ai_negotiation_tip: string | null;
  created_at: string;
}

export interface IdeaAndMood {
  id: string;
  event_id: string;
  category: 'decor' | 'cocktail_menu' | 'music' | 'invitation' | 'activity' | 'food' | 'theme';
  title: string;
  description: string;
  tags: string[];
  is_saved: boolean;
  created_at: string;
}

export interface Guest {
  id: string;
  event_id: string;
  full_name: string;
  email: string | null;
  rsvp_status: 'confirmed' | 'declined' | 'pending';
  dietary_restrictions: string | null;
  group_or_table: string | null;
  plus_ones: number;
  created_at: string;
}

export type EventType = Event['event_type'];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: '💍 Wedding',
  birthday: '🎂 Birthday',
  community: '🎪 Community Event',
  corporate: '💼 Corporate',
  anniversary: '🥂 Anniversary',
  baby_shower: '👶 Baby Shower',
};

export const BUDGET_CATEGORIES = [
  'Venue',
  'Catering & Food',
  'Photography & Video',
  'Music & Entertainment',
  'Decorations & Flowers',
  'Attire & Beauty',
  'Invitations & Stationery',
  'Transportation',
  'Gifts & Favors',
  'Miscellaneous',
] as const;

export const VENDOR_CATEGORIES = [
  'Venue',
  'Caterer',
  'Photographer',
  'Videographer',
  'DJ / Band',
  'Florist',
  'Decorator',
  'Baker',
  'Transport',
  'Officiant',
  'Planner',
  'Other',
] as const;

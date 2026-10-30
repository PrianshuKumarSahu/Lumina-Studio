-- FêteCraft Studio: Celebration & Event Planner Schema
-- Paste and run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'wedding', -- 'wedding', 'birthday', 'community', etc.
  theme_vibe TEXT,
  target_date DATE,
  guest_count INTEGER DEFAULT 50,
  total_budget NUMERIC(12, 2) DEFAULT 5000.00,
  location_city TEXT,
  notes TEXT,
  ai_summary TEXT,
  color_palette JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Timeline Items Table
CREATE TABLE IF NOT EXISTS timeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  phase TEXT NOT NULL, -- 'planning_early', 'planning_mid', 'final_weeks', 'day_of'
  title TEXT NOT NULL,
  description TEXT,
  time_slot TEXT, -- For day-of run of show e.g. '02:00 PM'
  due_date TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'logistics',
  priority TEXT DEFAULT 'medium',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Budget Items Table
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'Venue', 'Catering', 'Music', 'Photo & Video', etc.
  item_name TEXT NOT NULL,
  estimated_cost NUMERIC(10, 2) DEFAULT 0.00,
  actual_cost NUMERIC(10, 2) DEFAULT 0.00,
  is_paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  price_quote NUMERIC(10, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'researching', -- 'researching', 'contacted', 'contract_signed', 'paid'
  notes TEXT,
  ai_negotiation_tip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Ideas and Moodboard Table
CREATE TABLE IF NOT EXISTS ideas_and_mood (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'decor', 'cocktail_menu', 'music', 'invitation', 'activity'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  is_saved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Guests Table
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  rsvp_status TEXT DEFAULT 'pending', -- 'confirmed', 'declined', 'pending'
  dietary_restrictions TEXT,
  group_or_table TEXT,
  plus_ones INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) and allow public demo access with anon key
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas_and_mood ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Create policies for public anon access (perfect for free hackathon / portfolio demo)
CREATE POLICY "Allow public read-write for events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for timeline" ON timeline_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for budget" ON budget_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for vendors" ON vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for ideas" ON ideas_and_mood FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for guests" ON guests FOR ALL USING (true) WITH CHECK (true);

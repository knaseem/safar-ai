-- SafarAI Phase 6: User Accounts & Trip Management
-- Run this in your Supabase SQL Editor

-- 1. Create the saved_trips table
CREATE TABLE IF NOT EXISTS saved_trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_name TEXT NOT NULL,
  trip_data JSONB NOT NULL,
  is_halal BOOLEAN DEFAULT FALSE,
  destination TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_trips_user_id ON saved_trips(user_id);

-- 3. Enable Row Level Security
ALTER TABLE saved_trips ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies - Users can only access their own trips
CREATE POLICY "Users can view own trips" ON saved_trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips" ON saved_trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON saved_trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON saved_trips
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_saved_trips_updated_at
    BEFORE UPDATE ON saved_trips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Chat Messages Table
-- Stores multi-turn AI conversation history per trip
-- ============================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    trip_changes JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by trip
CREATE INDEX idx_chat_messages_trip_id ON chat_messages(trip_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only view their own chat messages
CREATE POLICY "Users can view own chat messages"
    ON chat_messages FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own chat messages
CREATE POLICY "Users can insert own chat messages"
    ON chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own chat messages
CREATE POLICY "Users can delete own chat messages"
    ON chat_messages FOR DELETE
    USING (auth.uid() = user_id);

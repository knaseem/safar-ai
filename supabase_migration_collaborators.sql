-- ============================================
-- Trip Collaborators Table
-- Tracks shared access to trips for group collaboration
-- ============================================

CREATE TABLE IF NOT EXISTS trip_collaborators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
    invite_token UUID DEFAULT gen_random_uuid(),
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Prevent duplicate collaborators per trip
    UNIQUE(trip_id, user_id),
    UNIQUE(trip_id, email)
);

-- Indexes
CREATE INDEX idx_trip_collaborators_trip_id ON trip_collaborators(trip_id);
CREATE INDEX idx_trip_collaborators_user_id ON trip_collaborators(user_id);
CREATE INDEX idx_trip_collaborators_token ON trip_collaborators(invite_token);

-- Enable RLS
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;

-- Trip owner (inviter) can manage collaborators
CREATE POLICY "Inviters can manage collaborators"
    ON trip_collaborators FOR ALL
    USING (auth.uid() = invited_by);

-- Collaborators can view their own invitations
CREATE POLICY "Users can view own collaborations"
    ON trip_collaborators FOR SELECT
    USING (auth.uid() = user_id);

-- Collaborators can update their own record (accept invite)
CREATE POLICY "Users can accept own invitations"
    ON trip_collaborators FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

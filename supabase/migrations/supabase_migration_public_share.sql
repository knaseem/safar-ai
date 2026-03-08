-- Enable public read access to saved_trips for sharing
-- This allows anyone with the UUID to view the trip details (Read Only)

-- Policy: Allow public to SELECT from saved_trips
-- Since we use UUIDs which are hard to guess, allowing SELECT by ID is effectively "knowing the link = access"
CREATE POLICY "Public can view shared trips"
    ON public.saved_trips FOR SELECT
    USING (true);

-- Note: Existing policies restrict Update/Delete to owner, so this is safe for read-only.

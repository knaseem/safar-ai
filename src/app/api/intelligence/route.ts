import { NextRequest, NextResponse } from 'next/server';
import { fetchLocationIntelligence } from '@/lib/amadeus';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Auth guard — prevents unauthenticated Amadeus API quota drain
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url);
        const lat = parseFloat(searchParams.get('lat') || '');
        const lng = parseFloat(searchParams.get('lng') || '');

        if (isNaN(lat) || isNaN(lng)) {
            return NextResponse.json({ error: 'Valid Latitude and Longitude are required' }, { status: 400 });
        }

        const intelligence = await fetchLocationIntelligence(lat, lng);

        return NextResponse.json(intelligence);
    } catch (error) {
        console.error('Intelligence API Routes Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

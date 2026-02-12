import { NextRequest, NextResponse } from 'next/server';
import { createLinkSession } from '@/lib/duffel';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tripId, userId, currency } = body;

        // Generate a reference for reconciliation as per docs
        const reference = tripId ? `TRIP_${tripId}` : (userId ? `USER_${userId}` : `SAFAR_${Date.now()}`);

        const session = await createLinkSession({
            reference,
            travellerCurrency: currency || 'USD',
            enableFlights: true,
            enableStays: true
        });

        // Track the session in the database if a tripId/userId is provided
        if (tripId && session.id) {
            const supabase = await createClient();
            await supabase
                .from('booking_requests')
                .update({
                    duffel_link_id: session.id,
                    status: 'pending'
                })
                .eq('trip_id', tripId);
        }

        return NextResponse.json({
            data: session,
            success: true
        });
    } catch (error: any) {
        console.error('Duffel Link Route Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create booking session' },
            { status: 500 }
        );
    }
}

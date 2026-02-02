import { NextRequest, NextResponse } from 'next/server';
import { searchLocations } from '@/lib/locations';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const type = searchParams.get('type') as 'CITY' | 'AIRPORT' | null;

    if (!keyword) {
        return NextResponse.json({ error: 'Missing keyword parameter' }, { status: 400 });
    }

    try {
        const locations = await searchLocations(keyword, type || undefined);
        return NextResponse.json({ data: locations });
    } catch (error) {
        console.error('Location Search Route Error:', error);
        return NextResponse.json({ error: 'Failed to search locations' }, { status: 500 });
    }
}

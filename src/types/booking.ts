// Booking request types for Phase 7.5+

export interface TravelerCount {
    adults: number
    children: number
    infants: number
}

export interface BookingContactInfo {
    firstName: string
    lastName: string
    email: string
    phone: string
}

export interface BookingRequest {
    // Trip reference
    trip_id?: string
    trip_name: string
    destination: string
    is_halal: boolean

    // Travel details
    departure_city: string
    departure_code: string
    check_in: string // ISO date
    check_out: string // ISO date
    travelers: TravelerCount

    // Preferences
    room_type: 'single' | 'double' | 'suite'
    flight_class: 'economy' | 'business' | 'first'
    seat_preference?: 'aisle' | 'window' | 'no-preference'
    baggage_count?: number
    dietary_requirements?: string
    is_special_occasion?: boolean
    occasion_type?: string

    // Contact
    contact: BookingContactInfo

    // Add-ons
    travel_insurance: boolean
    special_requests?: string

    // Pricing
    estimated_price: number
    insurance_price?: number

    // Status
    status: 'pending' | 'quoted' | 'booked' | 'cancelled'
}

// Phase 8 additions (when APIs are integrated):
export interface UnifiedBooking {
    id: string
    source: 'duffel' | 'concierge' | 'import'
    type: 'flight' | 'hotel' | 'activity' | 'custom'
    status: string
    tripId?: string
    tripName?: string // derived if linked
    label?: string    // custom label
    bookingReference?: string
    details: {
        title: string
        subtitle?: string
        date?: string
        image?: string
        price?: string
        currency?: string
        pnr?: string
        location?: string
        // Duffel-specific fields for self-service management
        origin?: string
        destination?: string
        duffelOrderId?: string
        conditions?: {
            refund_before_departure?: string | null
            change_before_departure?: string | null
        }
    }
    actions: {
        canCancel: boolean
        canModify: boolean
        canLink: boolean
    }
    originalData: any // full record
    createdAt: string
}
// - car_rental: boolean
// - airport_transfer: boolean
// - flexible_dates: boolean
// - loyalty_programs: { airline?: string; hotel?: string }
// - visa_required: boolean

// Major airports for autocomplete
export const MAJOR_AIRPORTS = [
    // US & Canada - Major Hubs
    { code: 'JFK', city: 'New York', name: 'John F. Kennedy International' },
    { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International' },
    { code: 'ORD', city: 'Chicago', name: "O'Hare International" },
    { code: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth International' },
    { code: 'DEN', city: 'Denver', name: 'Denver International' },
    { code: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta' },
    { code: 'SFO', city: 'San Francisco', name: 'San Francisco International' },
    { code: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International' },
    { code: 'MIA', city: 'Miami', name: 'Miami International' },
    { code: 'BOS', city: 'Boston', name: 'Logan International' },
    { code: 'EWR', city: 'Newark', name: 'Newark Liberty International' },
    { code: 'MCO', city: 'Orlando', name: 'Orlando International' },
    { code: 'LAS', city: 'Las Vegas', name: 'Harry Reid International' },
    { code: 'CLT', city: 'Charlotte', name: 'Charlotte Douglas International' },
    { code: 'PHX', city: 'Phoenix', name: 'Phoenix Sky Harbor' },
    { code: 'IAH', city: 'Houston', name: 'George Bush Intercontinental' },
    { code: 'YYZ', city: 'Toronto', name: 'Pearson International' },
    { code: 'YVR', city: 'Vancouver', name: 'Vancouver International' },
    { code: 'YUL', city: 'Montreal', name: 'Pierre Elliott Trudeau' },

    // US - Secondary & Regional
    { code: 'AUS', city: 'Austin', name: 'Austin-Bergstrom International' },
    { code: 'BNA', city: 'Nashville', name: 'Nashville International' },
    { code: 'IAD', city: 'Washington DC', name: 'Dulles International' },
    { code: 'DCA', city: 'Washington DC', name: 'Reagan National' },
    { code: 'PHL', city: 'Philadelphia', name: 'Philadelphia International' },
    { code: 'DTW', city: 'Detroit', name: 'Detroit Metropolitan' },
    { code: 'MSP', city: 'Minneapolis', name: 'Minneapolis-Saint Paul' },
    { code: 'SLC', city: 'Salt Lake City', name: 'Salt Lake City International' },
    { code: 'FLL', city: 'Fort Lauderdale', name: 'Fort Lauderdale-Hollywood' },
    { code: 'SAN', city: 'San Diego', name: 'San Diego International' },
    { code: 'TPA', city: 'Tampa', name: 'Tampa International' },
    { code: 'HNL', city: 'Honolulu', name: 'Daniel K. Inouye International' },
    { code: 'PDX', city: 'Portland', name: 'Portland International' },

    // Europe - Major Hubs
    { code: 'LHR', city: 'London', name: 'Heathrow' },
    { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle' },
    { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport' },
    { code: 'AMS', city: 'Amsterdam', name: 'Schiphol' },
    { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid–Barajas' },
    { code: 'BCN', city: 'Barcelona', name: 'Josep Tarradellas Barcelona–El Prat' },
    { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport' },
    { code: 'MUC', city: 'Munich', name: 'Munich Airport' },
    { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci–Fiumicino' },
    { code: 'LGW', city: 'London', name: 'Gatwick' },
    { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport' },
    { code: 'VIE', city: 'Vienna', name: 'Vienna International' },
    { code: 'CPH', city: 'Copenhagen', name: 'Copenhagen Airport' },
    { code: 'DUB', city: 'Dublin', name: 'Dublin Airport' },

    // Europe - Secondary & Holiday
    { code: 'OSL', city: 'Oslo', name: 'Oslo Gardermoen' },
    { code: 'ARN', city: 'Stockholm', name: 'Stockholm Arlanda' },
    { code: 'HEL', city: 'Helsinki', name: 'Helsinki-Vantaa' },
    { code: 'ATH', city: 'Athens', name: 'Athens International' },
    { code: 'LIS', city: 'Lisbon', name: 'Humberto Delgado' },
    { code: 'MXP', city: 'Milan', name: 'Malpensa' },
    { code: 'GVA', city: 'Geneva', name: 'Geneva Airport' },
    { code: 'WAW', city: 'Warsaw', name: 'Chopin Airport' },
    { code: 'BRU', city: 'Brussels', name: 'Brussels Airport' },
    { code: 'MAN', city: 'Manchester', name: 'Manchester Airport' },
    { code: 'EDI', city: 'Edinburgh', name: 'Edinburgh Airport' },
    { code: 'NCE', city: 'Nice', name: 'Nice Côte d\'Azur' },
    { code: 'KEF', city: 'Reykjavik', name: 'Keflavík International' },

    // Middle East
    { code: 'DXB', city: 'Dubai', name: 'Dubai International' },
    { code: 'DOH', city: 'Doha', name: 'Hamad International' },
    { code: 'AUH', city: 'Abu Dhabi', name: 'Zayed International' },
    { code: 'JED', city: 'Jeddah', name: 'King Abdulaziz International' },
    { code: 'RUH', city: 'Riyadh', name: 'King Khalid International' },
    { code: 'MED', city: 'Medina', name: 'Prince Mohammad bin Abdulaziz' },
    { code: 'CAI', city: 'Cairo', name: 'Cairo International' },
    { code: 'AMM', city: 'Amman', name: 'Queen Alia International' },
    { code: 'MCT', city: 'Muscat', name: 'Muscat International' },
    { code: 'KWI', city: 'Kuwait City', name: 'Kuwait International' },
    { code: 'BAH', city: 'Bahrain', name: 'Bahrain International' },
    { code: 'TLV', city: 'Tel Aviv', name: 'Ben Gurion' },

    // Asia
    { code: 'SIN', city: 'Singapore', name: 'Changi' },
    { code: 'HND', city: 'Tokyo', name: 'Haneda' },
    { code: 'NRT', city: 'Tokyo', name: 'Narita International' },
    { code: 'ICN', city: 'Seoul', name: 'Incheon International' },
    { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International' },
    { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
    { code: 'PEK', city: 'Beijing', name: 'Capital International' },
    { code: 'PVG', city: 'Shanghai', name: 'Pudong International' },
    { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International' },
    { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj' },
    { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International' },
    { code: 'SGN', city: 'Ho Chi Minh City', name: 'Tan Son Nhat' },
    { code: 'MNL', city: 'Manila', name: 'Ninoy Aquino' },
    { code: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta' },
    { code: 'TPE', city: 'Taipei', name: 'Taoyuan International' },
    { code: 'DPS', city: 'Bali', name: 'Ngurah Rai International' },
    { code: 'KIX', city: 'Osaka', name: 'Kansai International' },

    // Oceania
    { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith' },
    { code: 'MEL', city: 'Melbourne', name: 'Tullamarine' },
    { code: 'BNE', city: 'Brisbane', name: 'Brisbane Airport' },
    { code: 'AKL', city: 'Auckland', name: 'Auckland Airport' },

    // Latin America
    { code: 'MEX', city: 'Mexico City', name: 'Benito Juárez International' },
    { code: 'GRU', city: 'São Paulo', name: 'Guarulhos International' },
    { code: 'BOG', city: 'Bogotá', name: 'El Dorado International' },
    { code: 'LIM', city: 'Lima', name: 'Jorge Chávez International' },
    { code: 'SCL', city: 'Santiago', name: 'Arturo Merino Benítez' },
    { code: 'EZE', city: 'Buenos Aires', name: 'Ministro Pistarini' },
    { code: 'PTY', city: 'Panama City', name: 'Tocumen International' },

    // Africa
    { code: 'JNB', city: 'Johannesburg', name: 'O.R. Tambo International' },
    { code: 'CPT', city: 'Cape Town', name: 'Cape Town International' },
    { code: 'CMN', city: 'Casablanca', name: 'Mohammed V International' },
    { code: 'LOS', city: 'Lagos', name: 'Murtala Muhammed International' },
    { code: 'NBO', city: 'Nairobi', name: 'Jomo Kenyatta International' }
]

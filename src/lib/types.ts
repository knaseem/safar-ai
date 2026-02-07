export interface BudgetCategory {
    id: string
    label: string
    value: number
    color: string
    icon?: any
}

export interface Budget {
    id?: string
    trip_id: string
    user_id: string
    total_budget: number
    currency: string
    categories: {
        flights: number
        lodging: number
        food: number
        activities: number
        other: number
    }
}

// Minimal Trip interface based on usage
export interface Trip {
    id: string
    user_id: string
    destination: string
    start_date: string
    end_date: string
    trip_name?: string
    created_at: string
    trip_data?: any
}

export interface TripWithBudget extends Trip {
    budget: Budget | null
}

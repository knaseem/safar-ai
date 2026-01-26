import { useEffect } from 'react'
import { useSound } from '@/components/features/ambient-sound-provider'

interface TripData {
    trip_name: string
    sound_theme?: 'city' | 'nature' | 'ocean' | 'desert' | 'cafe'
    days: {
        theme: string
    }[]
}

export function useTripAudio(data: TripData) {
    const { setTheme } = useSound()

    useEffect(() => {
        if (data.sound_theme) {
            setTheme(data.sound_theme)
        } else {
            // Fallback to legacy keyword matching
            const dest = data.trip_name.toLowerCase() + (data.days[0]?.theme?.toLowerCase() || '')
            let newTheme: 'city' | 'nature' | 'ocean' | 'desert' | 'cafe' = 'city'

            if (dest.includes('beach') || dest.includes('island') || dest.includes('maldives') || dest.includes('bali') || dest.includes('coast')) {
                newTheme = 'ocean'
            } else if (dest.includes('hiking') || dest.includes('mountain') || dest.includes('forest') || dest.includes('park') || dest.includes('alps')) {
                newTheme = 'nature'
            } else if (dest.includes('dubai') || dest.includes('cairo') || dest.includes('desert') || dest.includes('dune') || dest.includes('safari')) {
                newTheme = 'desert'
            } else if (dest.includes('paris') || dest.includes('rome') || dest.includes('coffee') || dest.includes('cafe') || dest.includes('culinary')) {
                newTheme = 'cafe'
            }
            setTheme(newTheme)
        }

        return () => setTheme('quiet') // Reset on unmount
    }, [data.trip_name, setTheme, data.sound_theme, data.days])
}

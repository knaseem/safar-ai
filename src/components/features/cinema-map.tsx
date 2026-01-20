"use client"

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Play, Pause, Globe, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'

// CSS override for minimal Mapbox attribution
const mapboxStyles = `
.mapboxgl-ctrl-attrib {
    font-size: 6px !important;
    opacity: 0.3 !important;
    padding: 1px 3px !important;
    background: transparent !important;
}
.mapboxgl-ctrl-attrib a {
    font-size: 6px !important;
    color: rgba(255,255,255,0.3) !important;
}
.mapboxgl-ctrl-logo {
    width: 40px !important;
    height: 12px !important;
    opacity: 0.3 !important;
}
.mapboxgl-ctrl-bottom-left,
.mapboxgl-ctrl-bottom-right {
    opacity: 0.3 !important;
}
`

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

// Map styles
const MAP_STYLES = {
    dark: 'mapbox://styles/mapbox/dark-v11',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
}

interface Coordinates {
    lat: number
    lng: number
}

interface CinemaMapProps {
    locations: Coordinates[]
}

export function CinemaMap({ locations }: CinemaMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const [isPlaying, setIsPlaying] = useState(true) // Auto-play on load
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isSatellite, setIsSatellite] = useState(false)

    // Initialize Map
    useEffect(() => {
        if (!mapContainer.current) return
        if (!MAPBOX_TOKEN) return

        mapboxgl.accessToken = MAPBOX_TOKEN

        const startLocation = locations[0] || { lat: 48.8566, lng: 2.3522 }

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: isSatellite ? MAP_STYLES.satellite : MAP_STYLES.dark,
            center: [startLocation.lng, startLocation.lat],
            zoom: 13,
            pitch: 75,
            bearing: -17,
            interactive: true // Allow manual control when paused
        })

        // Add navigation controls (zoom, compass)
        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }), 'bottom-right')

        // Add pulsing markers
        locations.forEach((loc, i) => {
            const el = document.createElement('div')
            el.innerHTML = `
                <div class="relative">
                    <div class="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg z-10 relative"></div>
                    <div class="absolute inset-0 w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                </div>
            `
            el.style.cssText = 'cursor: pointer;'

            new mapboxgl.Marker(el)
                .setLngLat([loc.lng, loc.lat])
                .addTo(map.current!)
        })

        return () => map.current?.remove()
    }, [isSatellite])

    // Enhanced Animation Logic
    useEffect(() => {
        if (!map.current) return

        let interval: NodeJS.Timeout

        if (isPlaying) {
            const flyStep = () => {
                const nextIndex = (currentIndex + 1) % locations.length
                const loc = locations[nextIndex]

                // Dynamic camera effects based on location index
                const zoom = 13 + Math.sin(nextIndex) * 2 // Vary zoom 11-15
                const pitch = 65 + Math.cos(nextIndex * 0.5) * 10 // Vary pitch 55-75
                const bearing = nextIndex * 60 // Rotate more dramatically

                map.current?.flyTo({
                    center: [loc.lng, loc.lat],
                    zoom,
                    pitch,
                    bearing,
                    duration: 6000, // Slightly faster
                    essential: true,
                    curve: 1.5, // Smooth easing curve
                })
                setCurrentIndex(nextIndex)
            }

            // Start with a dramatic initial flight
            if (currentIndex === 0 && locations[0]) {
                map.current?.flyTo({
                    center: [locations[0].lng, locations[0].lat],
                    zoom: 14,
                    pitch: 75,
                    bearing: 30,
                    duration: 3000,
                })
            }

            interval = setInterval(flyStep, 6000)
        } else {
            map.current.stop()
        }

        return () => clearInterval(interval)
    }, [isPlaying, locations, currentIndex])

    const togglePlay = () => setIsPlaying(!isPlaying)
    const toggleStyle = () => setIsSatellite(!isSatellite)

    if (!MAPBOX_TOKEN) {
        return <div className="h-full w-full bg-neutral-900 flex items-center justify-center text-white/50">Mapbox Token Missing</div>
    }

    return (
        <div className="relative h-full w-full bg-black">
            <style dangerouslySetInnerHTML={{ __html: mapboxStyles }} />
            <div ref={mapContainer} className="h-full w-full" />

            {/* Controls - Top Right */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                {/* Day Indicator */}
                <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                    Day {currentIndex + 1} of {locations.length}
                </div>

                {/* Status Badge */}
                <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-medium">
                    {isPlaying ? "Flying" : "Paused"}
                </div>

                {/* Style Toggle */}
                <Button
                    size="icon"
                    className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white"
                    onClick={toggleStyle}
                    title={isSatellite ? "Switch to Dark" : "Switch to Satellite"}
                >
                    {isSatellite ? <Map className="size-4" /> : <Globe className="size-4" />}
                </Button>

                {/* Play/Pause */}
                <Button
                    size="icon"
                    className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white"
                    onClick={togglePlay}
                >
                    {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
                </Button>
            </div>

            {/* Overlay Gradients */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
        </div>
    )
}

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
.custom-map-popup .mapboxgl-popup-content {
    background: transparent !important;
    padding: 0 !important;
    box-shadow: none !important;
}
.custom-map-popup .mapboxgl-popup-tip {
    display: none !important;
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
    days?: { day: number; theme: string }[]
    activeIndex?: number
    onMarkerClick?: (index: number) => void
}

export function CinemaMap({ locations, days, activeIndex = 0, onMarkerClick }: CinemaMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const [isPlaying, setIsPlaying] = useState(true) // Auto-play on load
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isSatellite, setIsSatellite] = useState(false)
    const isPlayingRef = useRef(isPlaying)

    // Refs for animation and sync
    const airplaneMarkerRef = useRef<mapboxgl.Marker | null>(null)
    const pathCoordinatesRef = useRef<number[][]>([])
    const dayPathIndicesRef = useRef<number[]>([]) // Stores the index in allCoordinates for each day
    const progressRef = useRef(0)

    // Sync ref with state
    useEffect(() => {
        isPlayingRef.current = isPlaying
    }, [isPlaying])

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

        // Add flight path line connecting all days
        map.current.on('load', () => {
            if (!map.current) return

            // Gradient colors for each leg (vibrant travel colors)
            // Gradient colors for each leg (consistent Neon Cyan/Emerald theme)
            const legColors = [
                '#2dd4bf', // teal-400
                '#06b6d4', // cyan-500
                '#10b981', // emerald-500
                '#2dd4bf', // teal-400
                '#06b6d4', // cyan-500
                '#10b981', // emerald-500
            ]

            // Generate curved arc coordinates with MORE PRONOUNCED curvature
            const generateArc = (start: number[], end: number[], numPoints = 60): number[][] => {
                const points: number[][] = []
                for (let i = 0; i <= numPoints; i++) {
                    const t = i / numPoints
                    const lng = start[0] + (end[0] - start[0]) * t
                    const lat = start[1] + (end[1] - start[1]) * t

                    // INCREASED curvature - more pronounced arc
                    const distance = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2))
                    const arcHeight = Math.min(distance * 0.25, 1.2) // Increased from 0.15 to 0.25
                    const arc = Math.sin(t * Math.PI) * arcHeight

                    points.push([lng, lat + arc])
                }
                return points
            }

            // Store all coordinates for airplane animation
            let allCoordinates: number[][] = []

            // Create separate layers for each leg with different colors
            for (let i = 0; i < locations.length - 1; i++) {
                // Store the starting index for this day's leg
                dayPathIndicesRef.current[i] = allCoordinates.length

                const start = [locations[i].lng, locations[i].lat]
                const end = [locations[i + 1].lng, locations[i + 1].lat]
                const arcPoints = generateArc(start, end)
                allCoordinates = allCoordinates.concat(arcPoints)
                const color = legColors[i % legColors.length]

                // Add source for this leg
                map.current.addSource(`flight-leg-${i}`, {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: arcPoints
                        }
                    }
                })

                // Outer glow (THICKER)
                map.current.addLayer({
                    id: `flight-leg-${i}-glow-outer`,
                    type: 'line',
                    source: `flight-leg-${i}`,
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                        'line-color': color,
                        'line-width': 20, // Increased from 16
                        'line-opacity': 0.2,
                        'line-blur': 8
                    }
                })

                // Middle glow (THICKER)
                map.current.addLayer({
                    id: `flight-leg-${i}-glow-middle`,
                    type: 'line',
                    source: `flight-leg-${i}`,
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                        'line-color': color,
                        'line-width': 10, // Increased from 8
                        'line-opacity': 0.5,
                        'line-blur': 3
                    }
                })

                // Main solid line (THICKER)
                map.current.addLayer({
                    id: `flight-leg-${i}-solid`,
                    type: 'line',
                    source: `flight-leg-${i}`,
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                        'line-color': color,
                        'line-width': 4, // Increased from 3
                        'line-opacity': 1
                    }
                })

                // White center line for contrast
                map.current.addLayer({
                    id: `flight-leg-${i}-center`,
                    type: 'line',
                    source: `flight-leg-${i}`,
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                        'line-color': '#ffffff',
                        'line-width': 1.5,
                        'line-opacity': 0.6
                    }
                })
            }

            // Set the index for the final destination
            if (allCoordinates.length > 0) {
                dayPathIndicesRef.current[locations.length - 1] = allCoordinates.length - 1
            }

            // Only create airplane if we have coordinates
            if (allCoordinates.length > 0) {
                // Store path data for scroll sync
                pathCoordinatesRef.current = allCoordinates

                // Create airplane marker with a rotatable inner element
                const firstLoc = locations[0]
                const airplaneEl = document.createElement('div')
                airplaneEl.innerHTML = `
                    <div class="plane-inner" style="width: 24px; height: 24px; background: #f97316; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 15px #f97316, 0 0 30px #f97316; display: flex; align-items: center; justify-content: center;">
                    </div>
                `

                // Create and add marker at first location
                const airplaneMarker = new mapboxgl.Marker({
                    element: airplaneEl,
                    anchor: 'center'
                })
                    .setLngLat([firstLoc.lng, firstLoc.lat])
                    .addTo(map.current!)

                airplaneMarkerRef.current = airplaneMarker

                // Get reference to inner rotatable element
                const planeInner = airplaneEl.querySelector('.plane-inner') as HTMLElement

                const totalPoints = allCoordinates.length
                // Fit bounds to show all locations
                const bounds = new mapboxgl.LngLatBounds()
                locations.forEach(loc => bounds.extend([loc.lng, loc.lat]))
                map.current.fitBounds(bounds, {
                    padding: { top: 120, bottom: 120, left: 120, right: 120 }, // Generous padding
                    pitch: 40, // Reduced pitch for better overview
                    duration: 2000 // Smooth zoom out
                })

                const speed = 0.04 // Faster speed for visible movement

                const animateAirplane = () => {
                    if (!map.current) return

                    if (!isPlayingRef.current) {
                        requestAnimationFrame(animateAirplane)
                        return
                    }

                    // Check if we've reached the end
                    if (progressRef.current >= totalPoints - 1) {
                        // Ensure we land exactly at the last point
                        const lastCoord = pathCoordinatesRef.current[totalPoints - 1]
                        airplaneMarker.setLngLat([lastCoord[0], lastCoord[1]])
                        setIsPlaying(false) // Stop playing state
                        return // Stop animation loop
                    }

                    progressRef.current += speed

                    const idx = Math.floor(progressRef.current)
                    // Update current Day index for UI
                    const currentDayIndex = Math.floor((idx / totalPoints) * locations.length)
                    setCurrentIndex(Math.min(currentDayIndex, locations.length - 1))

                    const nextIdx = Math.min(idx + 1, totalPoints - 1)
                    const t = progressRef.current - idx

                    const coord = pathCoordinatesRef.current[idx]
                    const nextCoord = pathCoordinatesRef.current[nextIdx]

                    if (coord && nextCoord) {
                        const lng = coord[0] + (nextCoord[0] - coord[0]) * t
                        const lat = coord[1] + (nextCoord[1] - coord[1]) * t

                        airplaneMarker.setLngLat([lng, lat])
                    }

                    requestAnimationFrame(animateAirplane)
                }

                animateAirplane()
            }
        })

        // Add numbered day markers
        locations.forEach((loc, i) => {
            const dayData = days?.[i]
            const el = document.createElement('div')
            el.innerHTML = `
                <div class="relative group cursor-pointer z-50">
                    <!-- Glowing Base (Pulsing) -->
                    <div class="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl animate-pulse pointer-events-none"></div>
                    
                    <!-- Hover Glow -->
                    <div class="absolute -inset-4 bg-orange-500/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <!-- Main Marker Ring with Gradient Border -->
                    <div class="relative w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 via-orange-500 to-amber-700 p-[2px] shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-transform duration-300 group-hover:scale-110">
                        <!-- Inner Content -->
                        <div class="w-full h-full rounded-full bg-black/80 flex items-center justify-center backdrop-blur-md">
                            <span class="text-amber-400 text-sm font-bold font-mono pointer-events-none">${i + 1}</span>
                        </div>
                    </div>

                    <!-- Top Shine/Jewel Effect -->
                    <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-amber-200/50 blur-[1px] rounded-full pointer-events-none"></div>
                </div>
            `
            el.style.cssText = 'cursor: pointer;'

            el.addEventListener('click', (e) => {
                e.stopPropagation() // Prevent map from treating this as a generic click
                if (onMarkerClick) {
                    onMarkerClick(i)
                }
            })

            const marker = new mapboxgl.Marker(el)
                .setLngLat([loc.lng, loc.lat])

            if (dayData) {
                const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: false, className: 'custom-map-popup' })
                    .setHTML(`
                        <div style="background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; min-width: 150px; max-width: 200px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); font-family: system-ui, sans-serif; pointer-events: none;">
                            <div style="color: #34d399; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Day ${dayData.day}</div>
                            <div style="color: white; font-size: 13px; font-weight: 500; line-height: 1.3;">${dayData.theme}</div>
                        </div>
                    `)
                marker.setPopup(popup)

                el.addEventListener('mouseenter', () => popup.addTo(map.current!))
                el.addEventListener('mouseleave', () => popup.remove())
            }

            marker.addTo(map.current!)
        })

        return () => map.current?.remove()
    }, [isSatellite])
    // Handle external activeIndex changes (Scroll Sync)
    useEffect(() => {
        if (!map.current || activeIndex === undefined) return

        // If external index changes, we should probably stop auto-play to let user control
        if (activeIndex !== currentIndex) {
            setIsPlaying(false)
            setCurrentIndex(activeIndex)

            // Move marker to the specific day's location on the path
            const targetIndex = dayPathIndicesRef.current[activeIndex]
            if (targetIndex !== undefined && pathCoordinatesRef.current[targetIndex] && airplaneMarkerRef.current) {
                // Update progress so animation continues from here if resumed
                progressRef.current = targetIndex
                airplaneMarkerRef.current.setLngLat(pathCoordinatesRef.current[targetIndex] as [number, number])
            }

            const loc = locations[activeIndex]
            if (loc) {
                map.current.flyTo({
                    center: [loc.lng, loc.lat],
                    zoom: 14, // Closer zoom for specific day
                    pitch: 60,
                    bearing: activeIndex * 45, // Rotate a bit for each day
                    duration: 2000,
                    essential: true
                })
            }
        }
    }, [activeIndex, locations])



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

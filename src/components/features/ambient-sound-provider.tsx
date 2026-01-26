"use client"

import { useEffect, useRef, useState, createContext, useContext } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

// Context to allow other components to trigger mood changes
type SoundTheme = 'city' | 'nature' | 'ocean' | 'desert' | 'cafe' | 'quiet'

interface SoundContextType {
    setTheme: (theme: SoundTheme) => void
    isMuted: boolean
    toggleMute: () => void
}

const SoundContext = createContext<SoundContextType>({
    setTheme: () => { },
    isMuted: true,
    toggleMute: () => { }
})

export const useSound = () => useContext(SoundContext)

// Mock assets - in production these would be hosted files
const SOUND_ASSETS = {
    city: 'https://cdn.freesound.org/previews/244/244131_4388656-lq.mp3', // Distant city drone
    nature: 'https://cdn.freesound.org/previews/530/530415_1648170-lq.mp3', // Forest birds/wind
    ocean: 'https://cdn.freesound.org/previews/398/398246_5159489-lq.mp3', // Gentle waves
    quiet: '' // Silence
}

export function AmbientSoundProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<SoundTheme>('quiet')
    const [isMuted, setIsMuted] = useState(true)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Initial setup
    useEffect(() => {
        audioRef.current = new Audio()
        audioRef.current.loop = true
        audioRef.current.volume = 0

        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [])

    // Theme change logic with cross-fade
    // Reliable CDN assets
    const SOUND_ASSETS: Record<string, string> = {
        city: '/sounds/city.ogg', // Distant Highway
        nature: '/sounds/nature.ogg', // Summer Forest
        ocean: '/sounds/ocean.ogg', // Waves
        desert: '/sounds/desert.ogg', // Summer Ambience (Windy)
        cafe: '/sounds/cafe.ogg', // Coffee Shop
        quiet: ''
    }

    // Effect for volume cross-fading ONLY (not playing/pausing)
    useEffect(() => {
        if (!audioRef.current) return

        // If muted or quiet, desired vol is 0
        const targetVol = (isMuted || theme === 'quiet') ? 0 : 0.3

        const fade = setInterval(() => {
            if (!audioRef.current) return

            // Current volume alignment
            const current = audioRef.current.volume

            if (Math.abs(current - targetVol) < 0.02) {
                audioRef.current.volume = targetVol
                if (targetVol === 0 && !audioRef.current.paused) {
                    audioRef.current.pause()
                }
                clearInterval(fade)
            } else if (current < targetVol) {
                audioRef.current.volume += 0.02
            } else {
                audioRef.current.volume -= 0.02
            }
        }, 100)

        return () => clearInterval(fade)
    }, [isMuted, theme])

    // Effect for changing source track
    useEffect(() => {
        if (theme === 'quiet' || !audioRef.current) return

        // Only switch source if different
        // Note: In a real app we'd have double buffers for seamless crossfade
        // Here we just swap src
        audioRef.current.src = SOUND_ASSETS[theme]

        if (!isMuted) {
            const playPromise = audioRef.current.play()
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    console.log("Auto-play blocked, muting.")
                    setIsMuted(true)
                })
            }
        }
    }, [theme])

    const toggleMute = () => {
        if (isMuted) {
            setIsMuted(false)
            // IMMEDIATE PLAY on user interaction
            if (audioRef.current && theme !== 'quiet') {
                audioRef.current.src = SOUND_ASSETS[theme]
                audioRef.current.volume = 0
                audioRef.current.play().then(() => {
                    // Playback started successfully
                }).catch((e) => {
                    console.error("Playback failed:", e)
                    setIsMuted(true)
                })
            }
        } else {
            setIsMuted(true)
        }
    }

    return (
        <SoundContext.Provider value={{ setTheme, isMuted, toggleMute }}>
            {children}

            {/* Global Mute Toggle (Fixed bottom right or integrated in Navbar) */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={toggleMute}
                    className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-lg group"
                >
                    {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}

                    {/* Tooltip */}
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {isMuted ? "SafarAI Soundscapes" : "Mute Ambience"}
                    </span>
                </button>
            </div>
        </SoundContext.Provider>
    )
}

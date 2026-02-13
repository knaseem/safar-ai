"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, DollarSign, Armchair, ChevronLeft, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SeatMapProps {
    isOpen: boolean
    onClose: () => void
    onSelect?: (seat: SelectedSeat) => void
    cabinClass?: "economy" | "business" | "first"
    aircraft?: string
}

interface SelectedSeat {
    row: number
    column: string
    type: "standard" | "extra_legroom" | "exit_row" | "bulkhead"
    price: number
}

type SeatStatus = "available" | "occupied" | "selected" | "blocked"
type SeatType = "standard" | "extra_legroom" | "exit_row" | "bulkhead"

interface Seat {
    row: number
    column: string
    status: SeatStatus
    type: SeatType
    price: number
}

function generateEconomyLayout(): Seat[] {
    const seats: Seat[] = []
    const columns = ["A", "B", "C", "D", "E", "F"] // 3-3 layout
    const exitRows = [12, 26]
    const bulkheadRows = [1]

    for (let row = 1; row <= 32; row++) {
        const isExitRow = exitRows.includes(row)
        const isBulkhead = bulkheadRows.includes(row)

        for (const col of columns) {
            // Randomly mark some as occupied (40% chance)
            const isOccupied = Math.random() < 0.4
            const type: SeatType = isBulkhead ? "bulkhead" : isExitRow ? "exit_row" : row <= 5 ? "extra_legroom" : "standard"
            const basePrice = type === "extra_legroom" ? 45 : type === "exit_row" ? 55 : type === "bulkhead" ? 35 : 0

            seats.push({
                row,
                column: col,
                status: isOccupied ? "occupied" : "available",
                type,
                price: basePrice,
            })
        }
    }
    return seats
}

function generateBusinessLayout(): Seat[] {
    const seats: Seat[] = []
    const columns = ["A", "C", "D", "F"] // 2-2 layout with aisle

    for (let row = 1; row <= 8; row++) {
        for (const col of columns) {
            const isOccupied = Math.random() < 0.3
            seats.push({
                row,
                column: col,
                status: isOccupied ? "occupied" : "available",
                type: row <= 2 ? "bulkhead" : "standard",
                price: row <= 2 ? 0 : 0, // Business = all premium
            })
        }
    }
    return seats
}

export function SeatMap({ isOpen, onClose, onSelect, cabinClass = "economy", aircraft = "Boeing 737-800" }: SeatMapProps) {
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)

    const seats = useMemo(() => {
        return cabinClass === "business" ? generateBusinessLayout() : generateEconomyLayout()
    }, [cabinClass])

    const columns = cabinClass === "business" ? ["A", "C", "D", "F"] : ["A", "B", "C", "D", "E", "F"]
    const leftCols = cabinClass === "business" ? ["A", "C"] : ["A", "B", "C"]
    const rightCols = cabinClass === "business" ? ["D", "F"] : ["D", "E", "F"]
    const rows = [...new Set(seats.map(s => s.row))].sort((a, b) => a - b)

    const handleSeatClick = (seat: Seat) => {
        if (seat.status === "occupied" || seat.status === "blocked") return
        setSelectedSeat(prev => prev?.row === seat.row && prev?.column === seat.column ? null : seat)
    }

    const handleConfirm = () => {
        if (!selectedSeat || !onSelect) return
        onSelect({
            row: selectedSeat.row,
            column: selectedSeat.column,
            type: selectedSeat.type,
            price: selectedSeat.price,
        })
        onClose()
    }

    if (!isOpen) return null

    const getSeatColor = (seat: Seat) => {
        if (selectedSeat?.row === seat.row && selectedSeat?.column === seat.column) {
            return "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/30"
        }
        switch (seat.status) {
            case "occupied": return "bg-white/5 text-white/10 border-white/5 cursor-not-allowed"
            case "blocked": return "bg-transparent border-transparent cursor-not-allowed"
            default:
                switch (seat.type) {
                    case "extra_legroom": return "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 cursor-pointer"
                    case "exit_row": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30 cursor-pointer"
                    case "bulkhead": return "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30 cursor-pointer"
                    default: return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25 cursor-pointer"
                }
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", bounce: 0.2 }}
                    className="relative w-full max-w-md bg-neutral-900/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-5 border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-white">Select Your Seat</h2>
                                <p className="text-xs text-white/40">{aircraft} • {cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1)} Class</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <X className="size-4 text-white/50" />
                            </button>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-3 mt-4 flex-wrap">
                            <LegendItem color="bg-emerald-500/20 border-emerald-500/20" label="Standard" />
                            <LegendItem color="bg-blue-500/20 border-blue-500/20" label="Extra Legroom" />
                            <LegendItem color="bg-cyan-500/20 border-cyan-500/20" label="Exit Row" />
                            <LegendItem color="bg-amber-500 border-amber-400" label="Selected" />
                            <LegendItem color="bg-white/5 border-white/5" label="Occupied" />
                        </div>
                    </div>

                    {/* Seat Map */}
                    <div className="flex-1 overflow-y-auto p-4 CustomScrollbar">
                        {/* Aircraft nose */}
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-8 bg-white/5 border border-white/10 rounded-t-[40px] flex items-center justify-center">
                                <span className="text-[8px] text-white/20 uppercase tracking-wider">Front</span>
                            </div>
                        </div>

                        {/* Column headers */}
                        <div className="flex items-center justify-center gap-0 mb-2">
                            <div className="flex gap-1">
                                {leftCols.map(col => (
                                    <div key={col} className="size-8 flex items-center justify-center text-[10px] text-white/30 font-bold">{col}</div>
                                ))}
                            </div>
                            <div className="w-8" /> {/* Aisle */}
                            <div className="flex gap-1">
                                {rightCols.map(col => (
                                    <div key={col} className="size-8 flex items-center justify-center text-[10px] text-white/30 font-bold">{col}</div>
                                ))}
                            </div>
                        </div>

                        {/* Rows */}
                        {rows.map((row) => {
                            const rowSeats = seats.filter(s => s.row === row)
                            const exitRows = [12, 26]
                            const isExitRow = exitRows.includes(row)

                            return (
                                <div key={row}>
                                    {isExitRow && (
                                        <div className="flex items-center gap-2 my-2">
                                            <div className="flex-1 h-px bg-cyan-500/20" />
                                            <span className="text-[8px] text-cyan-500/50 uppercase tracking-wider font-bold">Emergency Exit</span>
                                            <div className="flex-1 h-px bg-cyan-500/20" />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center gap-0 mb-1">
                                        <div className="flex gap-1">
                                            {leftCols.map(col => {
                                                const seat = rowSeats.find(s => s.column === col)
                                                if (!seat) return <div key={col} className="size-8" />
                                                return (
                                                    <motion.button
                                                        key={`${row}${col}`}
                                                        whileHover={seat.status === "available" ? { scale: 1.1 } : undefined}
                                                        whileTap={seat.status === "available" ? { scale: 0.95 } : undefined}
                                                        onClick={() => handleSeatClick(seat)}
                                                        className={cn(
                                                            "size-8 rounded-md border text-[10px] font-bold transition-all flex items-center justify-center",
                                                            getSeatColor(seat)
                                                        )}
                                                        disabled={seat.status === "occupied" || seat.status === "blocked"}
                                                    >
                                                        {seat.status === "occupied" ? (
                                                            <User className="size-3 opacity-30" />
                                                        ) : (
                                                            `${row}${col}`
                                                        )}
                                                    </motion.button>
                                                )
                                            })}
                                        </div>

                                        {/* Row number in aisle */}
                                        <div className="w-8 flex items-center justify-center">
                                            <span className="text-[9px] text-white/15 font-mono">{row}</span>
                                        </div>

                                        <div className="flex gap-1">
                                            {rightCols.map(col => {
                                                const seat = rowSeats.find(s => s.column === col)
                                                if (!seat) return <div key={col} className="size-8" />
                                                return (
                                                    <motion.button
                                                        key={`${row}${col}`}
                                                        whileHover={seat.status === "available" ? { scale: 1.1 } : undefined}
                                                        whileTap={seat.status === "available" ? { scale: 0.95 } : undefined}
                                                        onClick={() => handleSeatClick(seat)}
                                                        className={cn(
                                                            "size-8 rounded-md border text-[10px] font-bold transition-all flex items-center justify-center",
                                                            getSeatColor(seat)
                                                        )}
                                                        disabled={seat.status === "occupied" || seat.status === "blocked"}
                                                    >
                                                        {seat.status === "occupied" ? (
                                                            <User className="size-3 opacity-30" />
                                                        ) : (
                                                            `${row}${col}`
                                                        )}
                                                    </motion.button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Aircraft tail */}
                        <div className="flex justify-center mt-4">
                            <div className="w-16 h-6 bg-white/5 border border-white/10 rounded-b-[30px] flex items-center justify-center">
                                <span className="text-[8px] text-white/20 uppercase tracking-wider">Rear</span>
                            </div>
                        </div>
                    </div>

                    {/* Selection Footer */}
                    <AnimatePresence>
                        {selectedSeat && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                className="p-4 border-t border-white/10 bg-neutral-900"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                            <Armchair className="size-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">
                                                Seat {selectedSeat.row}{selectedSeat.column}
                                            </p>
                                            <p className="text-[10px] text-white/40 capitalize">
                                                {selectedSeat.type.replace("_", " ")}
                                                {(selectedSeat.column === "A" || selectedSeat.column === "F") ? " • Window" :
                                                    (selectedSeat.column === "C" || selectedSeat.column === "D") ? " • Aisle" : " • Middle"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {selectedSeat.price > 0 ? (
                                            <>
                                                <p className="text-lg font-bold text-emerald-400">+${selectedSeat.price}</p>
                                                <p className="text-[10px] text-white/30">per passenger</p>
                                            </>
                                        ) : (
                                            <p className="text-sm font-medium text-emerald-400">Free</p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    onClick={handleConfirm}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-5 rounded-xl"
                                >
                                    <CheckCircle className="size-4 mr-2" />
                                    Confirm Seat {selectedSeat.row}{selectedSeat.column}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className={cn("size-3 rounded-sm border", color)} />
            <span className="text-[9px] text-white/40">{label}</span>
        </div>
    )
}

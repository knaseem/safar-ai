"use client"

import * as React from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
    checkIn: Date | null
    checkOut: Date | null
    onDateChange: (checkIn: Date | null, checkOut: Date | null) => void
    minDate?: Date
    className?: string
    label?: string
}

export function DateRangePicker({
    checkIn,
    checkOut,
    onDateChange,
    minDate = new Date(),
    className,
    label = "Travel Dates"
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [currentMonth, setCurrentMonth] = React.useState(new Date())
    const [selectingCheckOut, setSelectingCheckOut] = React.useState(false)

    const formatDate = (date: Date | null) => {
        if (!date) return "Select date"
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDay = firstDay.getDay()
        return { daysInMonth, startingDay }
    }

    const handleDayClick = (day: number) => {
        const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)

        if (!selectingCheckOut) {
            onDateChange(selectedDate, null)
            setSelectingCheckOut(true)
        } else {
            if (selectedDate > checkIn!) {
                onDateChange(checkIn, selectedDate)
                setSelectingCheckOut(false)
                setIsOpen(false)
            } else {
                onDateChange(selectedDate, null)
            }
        }
    }

    const isDateDisabled = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        return date < new Date(minDate.setHours(0, 0, 0, 0))
    }

    const isDateInRange = (day: number) => {
        if (!checkIn || !checkOut) return false
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        return date > checkIn && date < checkOut
    }

    const isCheckIn = (day: number) => {
        if (!checkIn) return false
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        return date.toDateString() === checkIn.toDateString()
    }

    const isCheckOut = (day: number) => {
        if (!checkOut) return false
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        return date.toDateString() === checkOut.toDateString()
    }

    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const emptyDays = Array.from({ length: startingDay }, (_, i) => i)

    const nights = checkIn && checkOut
        ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        : 0

    return (
        <div className={cn("relative", className)}>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">{label}</label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-left hover:bg-white/10 transition-colors"
            >
                <Calendar className="size-5 text-emerald-400" />
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-white">
                        <span>{formatDate(checkIn)}</span>
                        <span className="text-white/30">→</span>
                        <span>{formatDate(checkOut)}</span>
                    </div>
                    {nights > 0 && (
                        <div className="text-xs text-emerald-400 mt-0.5">{nights} night{nights > 1 ? 's' : ''}</div>
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-neutral-900 border border-white/10 rounded-xl shadow-2xl p-4">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="size-5 text-white" />
                        </button>
                        <span className="text-white font-medium">
                            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </span>
                        <button
                            type="button"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ChevronRight className="size-5 text-white" />
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-center text-xs text-white/40 py-1">{day}</div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {emptyDays.map(i => <div key={`empty-${i}`} />)}
                        {days.map(day => {
                            const disabled = isDateDisabled(day)
                            const inRange = isDateInRange(day)
                            const isStart = isCheckIn(day)
                            const isEnd = isCheckOut(day)

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => handleDayClick(day)}
                                    className={cn(
                                        "h-9 rounded-lg text-sm transition-colors",
                                        disabled && "text-white/20 cursor-not-allowed",
                                        !disabled && !isStart && !isEnd && !inRange && "text-white hover:bg-white/10",
                                        inRange && "bg-emerald-500/20 text-white",
                                        (isStart || isEnd) && "bg-emerald-500 text-black font-medium"
                                    )}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>

                    <div className="mt-3 text-center text-xs text-white/40">
                        {selectingCheckOut ? "Select check-out date" : "Select check-in date"}
                    </div>
                </div>
            )}
        </div>
    )
}

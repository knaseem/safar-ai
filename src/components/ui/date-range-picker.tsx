"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
    checkIn: Date | null
    checkOut: Date | null
    onDateChange: (checkIn: Date | null, checkOut: Date | null) => void
    minDate?: Date
    className?: string
}

export function DateRangePicker({
    checkIn,
    checkOut,
    onDateChange,
    minDate = new Date(),
    className,
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [currentMonth, setCurrentMonth] = React.useState(new Date())
    const [selectingCheckOut, setSelectingCheckOut] = React.useState(false)

    // Sync current month with checkIn if present and menu opens
    React.useEffect(() => {
        if (isOpen && checkIn) {
            setCurrentMonth(checkIn)
        }
    }, [isOpen])

    const formatDate = (date: Date | null) => {
        if (!date) return "Select date"
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    const formatLabelDate = (date: Date | null) => {
        if (!date) return "Add Date"
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
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
        // Reset hours for comparison
        selectedDate.setHours(0, 0, 0, 0)

        const minDateStr = new Date(minDate)
        minDateStr.setHours(0, 0, 0, 0)

        if (selectedDate < minDateStr) return

        if (!selectingCheckOut) {
            onDateChange(selectedDate, null)
            setSelectingCheckOut(true)
        } else {
            if (checkIn && selectedDate >= checkIn) {
                onDateChange(checkIn, selectedDate)
                setSelectingCheckOut(false)
                setIsOpen(false)
            } else {
                // If selecting checkout but picked a date before checkin, reset checkin
                onDateChange(selectedDate, null)
                setSelectingCheckOut(true)
            }
        }
    }

    const isDateDisabled = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        date.setHours(0, 0, 0, 0)
        const min = new Date(minDate)
        min.setHours(0, 0, 0, 0)
        return date < min
    }

    const isDateInRange = (day: number) => {
        if (!checkIn || !checkOut) return false
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        date.setHours(0, 0, 0, 0)

        const cIn = new Date(checkIn)
        cIn.setHours(0, 0, 0, 0)

        const cOut = new Date(checkOut)
        cOut.setHours(0, 0, 0, 0)

        return date > cIn && date < cOut
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

    return (
        <div className={cn("relative", className)}>
            <div
                onClick={() => {
                    setIsOpen(!isOpen)
                    if (!isOpen) setSelectingCheckOut(!!checkIn && !checkOut)
                }}
                className="flex items-center gap-0 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors h-[58px]"
            >
                {/* Check In Section */}
                <div className="flex-1 flex items-center gap-3 px-4 border-r border-white/10">
                    <CalendarIcon className="size-5 text-white/50" />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Check-In</span>
                        <span className={`text-sm font-medium ${checkIn ? 'text-white' : 'text-white/40'}`}>
                            {formatLabelDate(checkIn)}
                        </span>
                    </div>
                </div>

                {/* Check Out Section */}
                <div className="flex-1 flex items-center gap-3 px-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Check-Out</span>
                        <span className={`text-sm font-medium ${checkOut ? 'text-white' : 'text-white/40'}`}>
                            {formatLabelDate(checkOut)}
                        </span>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 w-[350px] bg-neutral-900 border border-white/10 rounded-xl shadow-2xl p-4 overflow-visible">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <span className="text-white font-medium">
                            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </span>
                        <button
                            type="button"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-center text-xs text-white/40 py-1 font-medium">{day}</div>
                        ))}
                    </div>

                    {/* Days Grid - Explicitly ensure it wraps */}
                    <div className="grid grid-cols-7 gap-1 w-full">
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDayClick(day)
                                    }}
                                    className={cn(
                                        "h-9 w-9 flex items-center justify-center rounded-lg text-sm transition-all relative z-10",
                                        disabled && "text-white/20 cursor-not-allowed",
                                        !disabled && !isStart && !isEnd && !inRange && "text-white hover:bg-white/10 hover:scale-110",
                                        inRange && "bg-emerald-500/20 text-white first:rounded-l-lg last:rounded-r-lg",
                                        (isStart || isEnd) && "bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                    )}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs text-white/40 flex justify-between">
                        <button onClick={() => setIsOpen(false)} className="hover:text-white">Close</button>
                        <span>{selectingCheckOut ? "Select check-out date" : "Select check-in date"}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

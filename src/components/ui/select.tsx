"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type SelectContextType = {
    value: string
    onValueChange: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | null>(null)

export const Select = ({ value, onValueChange, children, disabled }: any) => {
    const [open, setOpen] = React.useState(false)
    const ref = React.useRef<HTMLDivElement>(null)

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative" ref={ref}>{children}</div>
        </SelectContext.Provider>
    )
}

export const SelectTrigger = ({ className, children }: any) => {
    const { open, setOpen } = React.useContext(SelectContext)!
    return (
        <button
            className={cn("flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className)}
            onClick={() => setOpen(!open)}
            type="button"
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
}

export const SelectValue = ({ placeholder, children }: any) => {
    return <span>{children || placeholder}</span>
}

export const SelectContent = ({ className, children, position = "popper" }: any) => {
    const { open } = React.useContext(SelectContext)!
    if (!open) return null
    return (
        <div className={cn("absolute top-full z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80", className)}>
            <div className="p-1 bg-black/90 backdrop-blur-md border border-white/10">{children}</div>
        </div>
    )
}

export const SelectItem = ({ value, children, className }: any) => {
    const { onValueChange, setOpen, value: selectedValue } = React.useContext(SelectContext)!
    return (
        <div
            className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-white/10 hover:text-white cursor-pointer", className)}
            onClick={(e) => {
                e.stopPropagation()
                onValueChange(value)
                setOpen(false)
            }}
        >
            {selectedValue === value && (
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-emerald-500">
                    <Check className="h-4 w-4" />
                </span>
            )}
            {children}
        </div>
    )
}

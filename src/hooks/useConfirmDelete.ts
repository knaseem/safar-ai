"use client"

import { useState, useCallback } from "react"

interface UseConfirmDeleteOptions {
    onConfirm: (id: string) => Promise<void>
    timeout?: number
}

interface UseConfirmDeleteReturn {
    pendingDeleteId: string | null
    requestDelete: (id: string, e?: React.MouseEvent) => void
    cancelDelete: () => void
    confirmDelete: (id: string, e?: React.MouseEvent) => void
    isPending: (id: string) => boolean
}

/**
 * Hook for handling two-step delete confirmation
 * First click sets the item as pending, second click confirms deletion
 */
export function useConfirmDelete({
    onConfirm,
    timeout = 5000
}: UseConfirmDeleteOptions): UseConfirmDeleteReturn {
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

    const cancelDelete = useCallback(() => {
        if (timeoutId) {
            clearTimeout(timeoutId)
            setTimeoutId(null)
        }
        setPendingDeleteId(null)
    }, [timeoutId])

    const requestDelete = useCallback((id: string, e?: React.MouseEvent) => {
        e?.stopPropagation()

        // If already pending and same ID, trigger confirm
        if (pendingDeleteId === id) {
            confirmDelete(id, e)
            return
        }

        // Clear any existing timeout
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        // Set pending state
        setPendingDeleteId(id)

        // Auto-cancel after timeout
        const newTimeoutId = setTimeout(() => {
            setPendingDeleteId(null)
        }, timeout)
        setTimeoutId(newTimeoutId)
    }, [pendingDeleteId, timeoutId, timeout])

    const confirmDelete = useCallback(async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation()

        if (timeoutId) {
            clearTimeout(timeoutId)
            setTimeoutId(null)
        }

        try {
            await onConfirm(id)
        } finally {
            setPendingDeleteId(null)
        }
    }, [onConfirm, timeoutId])

    const isPending = useCallback((id: string) => {
        return pendingDeleteId === id
    }, [pendingDeleteId])

    return {
        pendingDeleteId,
        requestDelete,
        cancelDelete,
        confirmDelete,
        isPending
    }
}

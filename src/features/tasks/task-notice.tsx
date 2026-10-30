"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export const NOTICE_DURATION_MS = 6000

export type Notice = {
  /** A new id means a new notice: it replaces the old one and restarts the 6 seconds (EC-5). */
  id: number
  message: string
  action?: { label: string; run: () => void }
}

type Props = {
  notice: Notice | null
  onDismiss: () => void
}

/**
 * The one notice bar. It sits right behind the list in the page order so Tab reaches
 * "Rückgängig" after a delete (AC-25), and is only positioned at the bottom visually.
 */
export function TaskNotice({ notice, onDismiss }: Props) {
  const noticeId = notice?.id

  useEffect(() => {
    if (noticeId === undefined) return
    const timer = setTimeout(onDismiss, NOTICE_DURATION_MS)
    return () => clearTimeout(timer)
  }, [noticeId, onDismiss])

  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      {notice && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-border bg-card py-2 pl-4 pr-2 text-sm text-card-foreground">
          <span>{notice.message}</span>
          {notice.action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                notice.action?.run()
                onDismiss()
              }}
            >
              {notice.action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

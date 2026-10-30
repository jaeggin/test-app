"use client"

import { useEffect, useState } from "react"

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

function isTextField(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  )
}

/**
 * The one notice bar. It sits right behind the list in the page order and is only positioned at
 * the bottom visually. For people without a mouse (AC-25): Ctrl+Z / Cmd+Z runs the action from
 * anywhere outside a text field, and the 6 seconds wait while the bar has focus or the pointer.
 */
export function TaskNotice({ notice, onDismiss }: Props) {
  const noticeId = notice?.id
  const action = notice?.action
  // Keyed by notice id, so a hover or focus left over from one notice never holds the next one.
  const [hold, setHold] = useState({ id: -1, focused: false, hovered: false })
  const paused = hold.id === noticeId && (hold.focused || hold.hovered)

  useEffect(() => {
    if (noticeId === undefined || paused) return
    const timer = setTimeout(onDismiss, NOTICE_DURATION_MS)
    return () => clearTimeout(timer)
  }, [noticeId, paused, onDismiss])

  useEffect(() => {
    if (!action) return
    function onKeyDown(event: KeyboardEvent) {
      const isUndo =
        event.key.toLowerCase() === "z" &&
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        !event.altKey
      if (!isUndo || isTextField(event.target)) return
      event.preventDefault()
      action?.run()
      onDismiss()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [action, onDismiss])

  function setHeld(change: { focused?: boolean; hovered?: boolean }) {
    if (noticeId === undefined) return
    setHold((current) => ({
      id: noticeId,
      focused: current.id === noticeId ? current.focused : false,
      hovered: current.id === noticeId ? current.hovered : false,
      ...change,
    }))
  }

  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      {notice && (
        <div
          className="pointer-events-auto flex items-center gap-3 rounded-lg border border-border bg-card py-2 pl-4 pr-2 text-sm text-card-foreground"
          onFocus={() => setHeld({ focused: true })}
          onBlur={() => setHeld({ focused: false })}
          onMouseEnter={() => setHeld({ hovered: true })}
          onMouseLeave={() => setHeld({ hovered: false })}
        >
          <span>{notice.message}</span>
          {notice.action && (
            <Button
              variant="ghost"
              size="sm"
              title="Rückgängig mit Strg+Z oder ⌘Z"
              aria-keyshortcuts="Control+Z Meta+Z"
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

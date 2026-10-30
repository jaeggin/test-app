"use client"

import { useEffect, useRef, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { TITLE_MAX_LENGTH, type Task } from "./tasks.schema"
import type { ActionResult } from "./use-tasks"

export const taskToggleId = (id: string) => `task-toggle-${id}`

type Props = {
  task: Task
  onToggle: (id: string) => void
  onRename: (id: string, title: string) => ActionResult
  onDelete: (id: string) => void
  /** Lets the parent notice when a task vanishes underneath an open edit field (EC-4). */
  onEditingChange?: (id: string, editing: boolean) => void
}

export function TaskItem({ task, onToggle, onRename, onDelete, onEditingChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  // Enter/Esc unmount the field, which can still fire a blur: only the first finish counts.
  const finishedRef = useRef(false)
  const restoreFocusRef = useRef(false)

  useEffect(() => {
    onEditingChange?.(task.id, editing)
  }, [editing, task.id, onEditingChange])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    } else if (restoreFocusRef.current) {
      restoreFocusRef.current = false
      editButtonRef.current?.focus()
    }
  }, [editing])

  function startEditing() {
    finishedRef.current = false
    setError(null)
    setEditing(true)
  }

  function finish(save: boolean, viaKeyboard: boolean) {
    if (finishedRef.current) return
    if (save) {
      const result = onRename(task.id, inputRef.current?.value ?? "")
      if (!result.ok && result.reason !== "not-found") {
        // Stays open with the old title stored until a valid one is typed or Esc is pressed (AC-12).
        setError(
          result.reason === "empty"
            ? "Bitte einen Titel eingeben."
            : `Der Titel darf höchstens ${TITLE_MAX_LENGTH} Zeichen lang sein.`,
        )
        return
      }
    }
    finishedRef.current = true
    restoreFocusRef.current = viaKeyboard
    setError(null)
    setEditing(false)
  }

  const errorId = `task-error-${task.id}`

  return (
    <li className="flex items-start gap-1 border-b border-border py-1">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
        <Checkbox
          id={taskToggleId(task.id)}
          checked={task.done}
          onCheckedChange={() => onToggle(task.id)}
          aria-label={`Aufgabe „${task.title}“ erledigt`}
          className="relative size-5 border-muted-foreground after:absolute after:-inset-2.5 after:content-[''] data-[state=checked]:border-primary"
        />
      </div>

      {editing ? (
        <div className="min-w-0 flex-1">
          <Input
            ref={inputRef}
            defaultValue={task.title}
            maxLength={TITLE_MAX_LENGTH}
            aria-label={`Titel von „${task.title}“ bearbeiten`}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={() => setError(null)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                finish(true, true)
              } else if (event.key === "Escape") {
                event.preventDefault()
                finish(false, true)
              }
            }}
            onBlur={() => finish(true, false)}
          />
          <p id={errorId} role="status" className="mt-1 min-h-5 text-sm text-destructive">
            {error}
          </p>
        </div>
      ) : (
        <span
          className={cn(
            "min-w-0 flex-1 break-words py-2 text-base",
            task.done && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </span>
      )}

      {!editing && (
        <Button
          ref={editButtonRef}
          variant="ghost"
          size="icon"
          aria-label={`Aufgabe „${task.title}“ bearbeiten`}
          onClick={startEditing}
        >
          <Pencil aria-hidden />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Aufgabe „${task.title}“ löschen`}
        onClick={() => onDelete(task.id)}
      >
        <Trash2 aria-hidden />
      </Button>
    </li>
  )
}

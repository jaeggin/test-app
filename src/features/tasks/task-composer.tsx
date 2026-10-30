"use client"

import { useEffect, useState, type RefObject } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TITLE_MAX_LENGTH } from "./tasks.schema"
import type { ActionResult } from "./use-tasks"

type Props = {
  onAdd: (title: string) => ActionResult
  /** Owned by the parent so it can move focus here, e.g. after the last task was deleted. */
  inputRef: RefObject<HTMLInputElement | null>
}

export function TaskComposer({ onAdd, inputRef }: Props) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [inputRef])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = inputRef.current
    if (!input) return

    const result = onAdd(input.value)
    if (result.ok) {
      // Cleared in the same tick, so a second Enter right behind finds an empty field (EC-3).
      input.value = ""
      setError(null)
      input.focus()
      return
    }
    setError(
      result.reason === "too-long"
        ? `Der Titel darf höchstens ${TITLE_MAX_LENGTH} Zeichen lang sein.`
        : "Bitte einen Titel eingeben.",
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex gap-2">
        <label htmlFor="new-task-input" className="sr-only">
          Neue Aufgabe
        </label>
        <Input
          id="new-task-input"
          ref={inputRef}
          type="text"
          name="title"
          placeholder="Neue Aufgabe …"
          maxLength={TITLE_MAX_LENGTH}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "new-task-error" : undefined}
          onChange={() => setError(null)}
        />
        <Button type="submit">Hinzufügen</Button>
      </div>
      <p id="new-task-error" role="status" className="mt-1 min-h-5 text-sm text-destructive">
        {error}
      </p>
    </form>
  )
}

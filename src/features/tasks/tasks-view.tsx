"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { StorageAlert } from "./storage-alert"
import { TaskComposer } from "./task-composer"
import { taskToggleId } from "./task-item"
import { TaskList } from "./task-list"
import { TaskNotice, type Notice } from "./task-notice"
import type { TasksStore } from "./tasks.storage"
import { useTasks } from "./use-tasks"

const GONE_MESSAGE = "Diese Aufgabe existiert nicht mehr."

export function TasksView({ store }: { store?: TasksStore }) {
  const { loaded, tasks, storage, unreadable, add, toggle, rename, remove } = useTasks(store)
  const composerRef = useRef<HTMLInputElement>(null)
  const noticeCount = useRef(0)
  const [notice, setNotice] = useState<Notice | null>(null)

  // The task whose title field is open right now, if any (EC-4).
  const editingId = useRef<string | null>(null)

  const dismissNotice = useCallback(() => setNotice(null), [])

  const showNotice = useCallback((message: string, action?: Notice["action"]) => {
    noticeCount.current += 1
    setNotice({ id: noticeCount.current, message, action })
  }, [])

  // Another tab can delete the task under an open edit field; the field then vanishes with the
  // row, so say why instead of letting the typed text disappear silently.
  useEffect(() => {
    const id = editingId.current
    if (loaded && id && !tasks.some((task) => task.id === id)) {
      editingId.current = null
      showNotice(GONE_MESSAGE)
    }
  }, [loaded, tasks, showNotice])

  const handleEditingChange = useCallback((id: string, editing: boolean) => {
    if (editing) editingId.current = id
    else if (editingId.current === id) editingId.current = null
  }, [])

  function handleToggle(id: string) {
    if (!toggle(id).ok) showNotice(GONE_MESSAGE)
  }

  function handleRename(id: string, title: string) {
    const result = rename(id, title)
    if (!result.ok && result.reason === "not-found") showNotice(GONE_MESSAGE)
    return result
  }

  function handleDelete(id: string) {
    // Deleting the task you are editing yourself is not a surprise worth a notice.
    if (editingId.current === id) editingId.current = null
    const result = remove(id)
    if (!result.ok) {
      showNotice(GONE_MESSAGE)
      return
    }
    showNotice("Aufgabe gelöscht", {
      label: "Rückgängig",
      run: () => {
        result.undo()
        // Put the keyboard focus back on the restored task once it is on screen again.
        requestAnimationFrame(() => document.getElementById(taskToggleId(id))?.focus())
      },
    })
  }

  return (
    <main className="mx-auto w-full max-w-[640px] space-y-4 px-4 py-6">
      <StorageAlert storage={storage} unreadable={unreadable} />
      <TaskComposer onAdd={add} inputRef={composerRef} />

      {!loaded ? (
        <div role="status" aria-busy="true" aria-label="Aufgaben werden geladen" className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : tasks.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Noch keine Aufgaben. Schreib die erste.</p>
      ) : (
        <TaskList
          tasks={tasks}
          onToggle={handleToggle}
          onRename={handleRename}
          onDelete={handleDelete}
          onFocusComposer={() => composerRef.current?.focus()}
          onEditingChange={handleEditingChange}
        />
      )}

      <TaskNotice notice={notice} onDismiss={dismissNotice} />
    </main>
  )
}

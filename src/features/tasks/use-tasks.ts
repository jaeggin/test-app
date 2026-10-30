"use client"

import { useCallback, useRef, useSyncExternalStore } from 'react'
import {
  addTask,
  removeTask,
  renameTask,
  restoreTask,
  toggleTask,
  type RemovedTask,
} from './tasks.rules'
import type { Task } from './tasks.schema'
import { tasksStore, type TasksState, type TasksStore } from './tasks.storage'

export type ActionResult =
  | { ok: true }
  | { ok: false; reason: 'empty' | 'too-long' | 'not-found' }

export type UseTasks = {
  loaded: boolean
  tasks: Task[]
  storage: TasksState['storage']
  unreadable: boolean
  add: (title: string) => ActionResult
  toggle: (id: string) => ActionResult
  rename: (id: string, title: string) => ActionResult
  /** Deletes at once; the returned handle puts the task back at its old position. */
  remove: (id: string) => { ok: true; undo: () => void } | { ok: false; reason: 'not-found' }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Every action reads the freshest stored list first, applies exactly one change to it and
 * writes the result back. That is what keeps two open tabs from overwriting each other (AC-19,
 * AC-20) and what turns a task deleted elsewhere into "not found" instead of a resurrection (EC-4).
 */
export function useTasks(store: TasksStore = tasksStore): UseTasks {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
  const storeRef = useRef(store)

  const add = useCallback((title: string): ActionResult => {
    const s = storeRef.current
    const result = addTask(s.refresh(), title, newId())
    if (!result.ok) return result
    s.write(result.tasks)
    return { ok: true }
  }, [])

  const toggle = useCallback((id: string): ActionResult => {
    const s = storeRef.current
    const result = toggleTask(s.refresh(), id)
    if (!result.ok) return result
    s.write(result.tasks)
    return { ok: true }
  }, [])

  const rename = useCallback((id: string, title: string): ActionResult => {
    const s = storeRef.current
    const result = renameTask(s.refresh(), id, title)
    if (!result.ok) return result
    s.write(result.tasks)
    return { ok: true }
  }, [])

  const remove = useCallback((id: string) => {
    const s = storeRef.current
    const result = removeTask(s.refresh(), id)
    if (!result.ok) return result
    s.write(result.tasks)
    const removed: RemovedTask = result.removed
    return {
      ok: true as const,
      undo: () => s.write(restoreTask(s.refresh(), removed)),
    }
  }, [])

  return {
    loaded: state.loaded,
    tasks: state.tasks,
    storage: state.storage,
    unreadable: state.unreadable,
    add,
    toggle,
    rename,
    remove,
  }
}

import { parseTitle, type Task } from './tasks.schema'

export type ListResult =
  | { ok: true; tasks: Task[] }
  | { ok: false; reason: 'not-found' | 'empty' | 'too-long' }

export type RemovedTask = { task: Task; index: number }

export type RemoveResult =
  | { ok: true; tasks: Task[]; removed: RemovedTask }
  | { ok: false; reason: 'not-found' }

/** The new task goes to the top, open (AC-2). The id comes from the caller. */
export function addTask(tasks: Task[], rawTitle: string, id: string): ListResult {
  const title = parseTitle(rawTitle)
  if (!title.ok) return { ok: false, reason: title.reason }
  return { ok: true, tasks: [{ id, title: title.title, done: false }, ...tasks] }
}

/** Flips done and keeps the position (AC-7, AC-8). */
export function toggleTask(tasks: Task[], id: string): ListResult {
  if (!tasks.some((task) => task.id === id)) return { ok: false, reason: 'not-found' }
  return {
    ok: true,
    tasks: tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
  }
}

/** Replaces the title; position and done stay (AC-10, AC-13). A missing task wins over a bad title (EC-4). */
export function renameTask(tasks: Task[], id: string, rawTitle: string): ListResult {
  if (!tasks.some((task) => task.id === id)) return { ok: false, reason: 'not-found' }
  const title = parseTitle(rawTitle)
  if (!title.ok) return { ok: false, reason: title.reason }
  return {
    ok: true,
    tasks: tasks.map((task) => (task.id === id ? { ...task, title: title.title } : task)),
  }
}

/** Removes the task and reports where it was, so it can be put back (AC-15, AC-16). */
export function removeTask(tasks: Task[], id: string): RemoveResult {
  const index = tasks.findIndex((task) => task.id === id)
  if (index === -1) return { ok: false, reason: 'not-found' }
  return {
    ok: true,
    tasks: [...tasks.slice(0, index), ...tasks.slice(index + 1)],
    removed: { task: tasks[index], index },
  }
}

/** Puts a removed task back at its old position, or at the end if the list got shorter (AC-16). */
export function restoreTask(tasks: Task[], removed: RemovedTask): Task[] {
  if (tasks.some((task) => task.id === removed.task.id)) return tasks
  // slice clamps an index past the end, so a shorter list puts the task last
  return [...tasks.slice(0, removed.index), removed.task, ...tasks.slice(removed.index)]
}

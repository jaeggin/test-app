"use client"

import { TaskItem, taskToggleId } from "./task-item"
import type { Task } from "./tasks.schema"
import type { ActionResult } from "./use-tasks"

type Props = {
  tasks: Task[]
  onToggle: (id: string) => void
  onRename: (id: string, title: string) => ActionResult
  onDelete: (id: string) => void
  /** Called when the deleted task was the last one, so keyboard focus is not left behind. */
  onFocusComposer: () => void
}

export function TaskList({ tasks, onToggle, onRename, onDelete, onFocusComposer }: Props) {
  function handleDelete(id: string) {
    // Move focus to a row that stays, before the deleted one disappears (AC-25).
    const index = tasks.findIndex((task) => task.id === id)
    const neighbour = tasks[index + 1] ?? tasks[index - 1]
    if (neighbour) document.getElementById(taskToggleId(neighbour.id))?.focus()
    else onFocusComposer()
    onDelete(id)
  }

  return (
    <ul aria-label="Aufgaben">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onRename={onRename}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  )
}

import { describe, expect, it } from 'vitest'
import { addTask, removeTask, renameTask, restoreTask, toggleTask } from './tasks.rules'
import type { Task } from './tasks.schema'

const list: Task[] = [
  { id: 'a', title: 'Erste', done: false },
  { id: 'b', title: 'Zweite', done: true },
  { id: 'c', title: 'Dritte', done: false },
]

describe('addTask', () => {
  it('puts a new open task on top (AC-2)', () => {
    const result = addTask(list, 'Neu', 'n')
    expect(result).toEqual({
      ok: true,
      tasks: [{ id: 'n', title: 'Neu', done: false }, ...list],
    })
  })

  it('trims the title (AC-5)', () => {
    const result = addTask([], '  Neu  ', 'n')
    expect(result).toEqual({ ok: true, tasks: [{ id: 'n', title: 'Neu', done: false }] })
  })

  it('rejects an empty title (AC-3)', () => {
    expect(addTask(list, '   ', 'n')).toEqual({ ok: false, reason: 'empty' })
  })

  it('rejects a title over 200 characters (AC-4)', () => {
    expect(addTask(list, 'a'.repeat(201), 'n')).toEqual({ ok: false, reason: 'too-long' })
  })

  it('allows a duplicate title as its own task (AC-6)', () => {
    const result = addTask(list, 'Erste', 'n')
    expect(result.ok && result.tasks.filter((task) => task.title === 'Erste')).toHaveLength(2)
  })

  it('does not change the list it was given', () => {
    const copy = structuredClone(list)
    addTask(list, 'Neu', 'n')
    expect(list).toEqual(copy)
  })
})

describe('toggleTask', () => {
  it('marks an open task done and keeps its position (AC-7)', () => {
    const result = toggleTask(list, 'a')
    expect(result).toEqual({
      ok: true,
      tasks: [{ id: 'a', title: 'Erste', done: true }, list[1], list[2]],
    })
  })

  it('reopens a done task (AC-8)', () => {
    const result = toggleTask(list, 'b')
    expect(result.ok && result.tasks[1]).toEqual({ id: 'b', title: 'Zweite', done: false })
  })

  it('reports a missing task (EC-4)', () => {
    expect(toggleTask(list, 'x')).toEqual({ ok: false, reason: 'not-found' })
  })
})

describe('renameTask', () => {
  it('replaces the title and keeps position and done (AC-10)', () => {
    const result = renameTask(list, 'b', '  Geändert ')
    expect(result).toEqual({
      ok: true,
      tasks: [list[0], { id: 'b', title: 'Geändert', done: true }, list[2]],
    })
  })

  it('rejects an empty title and leaves the task alone (AC-12)', () => {
    expect(renameTask(list, 'a', ' ')).toEqual({ ok: false, reason: 'empty' })
  })

  it('rejects a title over 200 characters', () => {
    expect(renameTask(list, 'a', 'a'.repeat(201))).toEqual({ ok: false, reason: 'too-long' })
  })

  it('reports a missing task even if the title is invalid (EC-4)', () => {
    expect(renameTask(list, 'x', '')).toEqual({ ok: false, reason: 'not-found' })
  })
})

describe('removeTask', () => {
  it('removes the task and reports its position (AC-15)', () => {
    const result = removeTask(list, 'b')
    expect(result).toEqual({
      ok: true,
      tasks: [list[0], list[2]],
      removed: { task: list[1], index: 1 },
    })
  })

  it('reports a missing task (EC-4)', () => {
    expect(removeTask(list, 'x')).toEqual({ ok: false, reason: 'not-found' })
  })
})

describe('restoreTask', () => {
  it('puts the task back at its old position with its title and done state (AC-16)', () => {
    const removed = removeTask(list, 'b')
    if (!removed.ok) throw new Error('setup failed')
    expect(restoreTask(removed.tasks, removed.removed)).toEqual(list)
  })

  it('puts the task at the end if the list got shorter meanwhile', () => {
    const result = restoreTask([list[0]], { task: list[2], index: 5 })
    expect(result).toEqual([list[0], list[2]])
  })

  it('puts the task on top when it was first', () => {
    const result = restoreTask([list[1], list[2]], { task: list[0], index: 0 })
    expect(result).toEqual(list)
  })

  it('does not add a task twice', () => {
    expect(restoreTask(list, { task: list[0], index: 0 })).toEqual(list)
  })
})

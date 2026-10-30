import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TaskList } from './task-list'
import type { Task } from './tasks.schema'

const tasks: Task[] = [
  { id: 'a', title: 'Erste', done: false },
  { id: 'b', title: 'Zweite', done: true },
  { id: 'c', title: 'Dritte', done: false },
]

function setup(list: Task[] = tasks) {
  const handlers = {
    onToggle: vi.fn(),
    onRename: vi.fn(() => ({ ok: true as const })),
    onDelete: vi.fn(),
    onFocusComposer: vi.fn(),
  }
  render(<TaskList tasks={list} {...handlers} />)
  return handlers
}

describe('TaskList', () => {
  it('shows the tasks in the given order (AC-2, AC-18)', () => {
    setup()
    const items = within(screen.getByRole('list', { name: 'Aufgaben' })).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual(['Erste', 'Zweite', 'Dritte'])
  })

  it('keeps done tasks at their place (AC-7)', () => {
    setup()
    const items = screen.getAllByRole('listitem')
    expect(within(items[1]).getByRole('checkbox')).toBeChecked()
  })

  it('passes toggle and rename for the right task', () => {
    const { onToggle, onRename } = setup()
    fireEvent.click(within(screen.getAllByRole('listitem')[2]).getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('c')

    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Zweite“ bearbeiten' }))
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(onRename).toHaveBeenCalledWith('b', 'Zweite')
  })

  it('moves focus to the next row before a task is deleted (AC-25)', () => {
    const { onDelete } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Erste“ löschen' }))
    expect(onDelete).toHaveBeenCalledWith('a')
    expect(screen.getByRole('checkbox', { name: 'Aufgabe „Zweite“ erledigt' })).toHaveFocus()
  })

  it('moves focus to the previous row when the last row is deleted (AC-25)', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Dritte“ löschen' }))
    expect(screen.getByRole('checkbox', { name: 'Aufgabe „Zweite“ erledigt' })).toHaveFocus()
  })

  it('hands focus to the composer when the only task is deleted (AC-25)', () => {
    const { onFocusComposer, onDelete } = setup([tasks[0]])
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Erste“ löschen' }))
    expect(onFocusComposer).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith('a')
  })

  it('does not call the composer while other tasks remain', () => {
    const { onFocusComposer } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Zweite“ löschen' }))
    expect(onFocusComposer).not.toHaveBeenCalled()
  })
})

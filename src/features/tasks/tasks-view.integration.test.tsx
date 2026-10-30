import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY, createTasksStore } from './tasks.storage'
import { TasksView } from './tasks-view'

function add(scope: ReturnType<typeof within>, title: string) {
  const input = scope.getByRole('textbox', { name: 'Neue Aufgabe' })
  fireEvent.change(input, { target: { value: title } })
  fireEvent.submit(input.closest('form')!)
}

const titles = (scope: ReturnType<typeof within>) =>
  scope.queryAllByRole('listitem').map((item: HTMLElement) => item.textContent)

function otherTabHears() {
  act(() => {
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
  })
}

beforeEach(() => {
  localStorage.clear()
})

describe('whole flow', () => {
  it('add, tick, edit, delete, undo, reload: the list survives every step (AC-18)', () => {
    const first = render(<TasksView store={createTasksStore()} />)
    const view = within(first.container)

    add(view, 'Milch kaufen')
    add(view, 'Anrufen')
    fireEvent.click(view.getByRole('checkbox', { name: 'Aufgabe „Milch kaufen“ erledigt' }))
    fireEvent.click(view.getByRole('button', { name: 'Aufgabe „Anrufen“ bearbeiten' }))
    const field = view.getByRole('textbox', { name: /bearbeiten/ })
    fireEvent.change(field, { target: { value: 'Zurückrufen' } })
    fireEvent.keyDown(field, { key: 'Enter' })
    fireEvent.click(view.getByRole('button', { name: 'Aufgabe „Zurückrufen“ löschen' }))
    fireEvent.click(view.getByRole('button', { name: 'Rückgängig' }))
    expect(titles(view)).toEqual(['Zurückrufen', 'Milch kaufen'])
    first.unmount()

    const reloaded = render(<TasksView store={createTasksStore()} />)
    const after = within(reloaded.container)
    expect(titles(after)).toEqual(['Zurückrufen', 'Milch kaufen'])
    expect(after.getByRole('checkbox', { name: 'Aufgabe „Milch kaufen“ erledigt' })).toBeChecked()
    expect(after.getByRole('checkbox', { name: 'Aufgabe „Zurückrufen“ erledigt' })).not.toBeChecked()
  })

  it('creates exactly one task when Enter is pressed twice in a row (EC-3)', () => {
    const { container } = render(<TasksView store={createTasksStore()} />)
    const view = within(container)
    const input = view.getByRole('textbox', { name: 'Neue Aufgabe' })
    fireEvent.change(input, { target: { value: 'Einmal' } })
    const form = input.closest('form')!
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(titles(view)).toEqual(['Einmal'])
  })

  it('keeps only the newest deletion undoable, and a reload keeps both gone (EC-5, EC-6)', () => {
    const first = render(<TasksView store={createTasksStore()} />)
    const view = within(first.container)
    add(view, 'Erste')
    add(view, 'Zweite')
    fireEvent.click(view.getByRole('button', { name: 'Aufgabe „Zweite“ löschen' }))
    fireEvent.click(view.getByRole('button', { name: 'Aufgabe „Erste“ löschen' }))
    expect(view.getAllByRole('button', { name: 'Rückgängig' })).toHaveLength(1)
    first.unmount()

    const reloaded = render(<TasksView store={createTasksStore()} />)
    expect(titles(within(reloaded.container))).toEqual([])
  })
})

describe('two tabs', () => {
  function twoTabs() {
    const a = render(<TasksView store={createTasksStore()} />)
    const b = render(<TasksView store={createTasksStore()} />)
    return { a: within(a.container), b: within(b.container) }
  }

  it('shows a change from one tab in the other without a reload (AC-19)', () => {
    const { a, b } = twoTabs()
    add(a, 'Aus Tab A')
    otherTabHears()
    expect(titles(b)).toEqual(['Aus Tab A'])

    fireEvent.click(b.getByRole('checkbox', { name: 'Aufgabe „Aus Tab A“ erledigt' }))
    otherTabHears()
    expect(a.getByRole('checkbox', { name: 'Aufgabe „Aus Tab A“ erledigt' })).toBeChecked()
  })

  it('keeps both changes when the two tabs touch different tasks (AC-19)', () => {
    const { a, b } = twoTabs()
    add(a, 'Erste')
    add(a, 'Zweite')
    otherTabHears()

    // Tab B ticks "Erste", tab A (not told yet) renames "Zweite".
    fireEvent.click(b.getByRole('checkbox', { name: 'Aufgabe „Erste“ erledigt' }))
    fireEvent.click(a.getByRole('button', { name: 'Aufgabe „Zweite“ bearbeiten' }))
    const field = a.getByRole('textbox', { name: /bearbeiten/ })
    fireEvent.change(field, { target: { value: 'Zweite neu' } })
    fireEvent.keyDown(field, { key: 'Enter' })
    otherTabHears()

    expect(titles(b)).toEqual(['Zweite neu', 'Erste'])
    expect(b.getByRole('checkbox', { name: 'Aufgabe „Erste“ erledigt' })).toBeChecked()
  })

  it('lets the last save win when both tabs rename the same task (AC-20)', () => {
    const { a, b } = twoTabs()
    add(a, 'Erste')
    otherTabHears()

    for (const [tab, title] of [[b, 'Von Tab B'], [a, 'Von Tab A']] as const) {
      fireEvent.click(tab.getByRole('button', { name: /bearbeiten/ }))
      const field = tab.getByRole('textbox', { name: /bearbeiten/ })
      fireEvent.change(field, { target: { value: title } })
      fireEvent.keyDown(field, { key: 'Enter' })
    }
    otherTabHears()

    expect(titles(a)).toEqual(['Von Tab A'])
    expect(titles(b)).toEqual(['Von Tab A'])
  })

  it('does not resurrect a task that the other tab deleted (EC-4)', () => {
    const { a, b } = twoTabs()
    add(a, 'Erste')
    otherTabHears()

    fireEvent.click(b.getByRole('button', { name: 'Aufgabe „Erste“ löschen' }))
    fireEvent.click(a.getByRole('checkbox', { name: 'Aufgabe „Erste“ erledigt' }))

    expect(a.getByText('Diese Aufgabe existiert nicht mehr.')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').tasks).toEqual([])
    expect(screen.queryAllByRole('listitem')).toEqual([])
  })
})

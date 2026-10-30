import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY, createTasksStore } from './tasks.storage'
import { TasksView } from './tasks-view'

function renderView() {
  const store = createTasksStore()
  render(<TasksView store={store} />)
  return store
}

function addTask(title: string) {
  const input = screen.getByRole('textbox', { name: 'Neue Aufgabe' })
  fireEvent.change(input, { target: { value: title } })
  fireEvent.submit(input.closest('form')!)
}

function titles() {
  return screen.queryAllByRole('listitem').map((item) => item.textContent)
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('states', () => {
  it('renders placeholders on the server until the browser storage is read (AC-23)', () => {
    const html = renderToString(<TasksView store={createTasksStore()} />)
    expect(html).toContain('aria-busy="true"')
    expect(html).not.toContain('Noch keine Aufgaben')
  })

  it('shows the empty message and puts the focus in the input (AC-1, AC-22)', () => {
    renderView()
    expect(screen.getByText('Noch keine Aufgaben. Schreib die erste.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Neue Aufgabe' })).toHaveFocus()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('shows stored tasks right away without the empty message (AC-18)', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, tasks: [{ id: 'a', title: 'Gespeichert', done: false }] }),
    )
    renderView()
    expect(titles()).toEqual(['Gespeichert'])
    expect(screen.queryByText('Noch keine Aufgaben. Schreib die erste.')).not.toBeInTheDocument()
  })

  it('warns when changes cannot be saved and keeps working (AC-21)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    renderView()
    expect(screen.getByRole('alert')).toHaveTextContent('Änderungen werden nicht gespeichert.')
    addTask('Nur im Speicher')
    expect(titles()).toEqual(['Nur im Speicher'])
  })

  it('warns about unreadable data and shows an empty list (EC-7)', () => {
    localStorage.setItem(STORAGE_KEY, '{kaputt')
    renderView()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Gespeicherte Aufgaben konnten nicht gelesen werden.',
    )
    expect(screen.getByText('Noch keine Aufgaben. Schreib die erste.')).toBeInTheDocument()
  })
})

describe('using the list', () => {
  it('adds tasks on top and drops the empty message (AC-2)', () => {
    renderView()
    addTask('Erste')
    addTask('Zweite')
    expect(titles()).toEqual(['Zweite', 'Erste'])
    expect(screen.queryByText('Noch keine Aufgaben. Schreib die erste.')).not.toBeInTheDocument()
  })

  it('ticks and unticks a task in place (AC-7, AC-8)', () => {
    renderView()
    addTask('Erste')
    addTask('Zweite')
    const box = screen.getByRole('checkbox', { name: 'Aufgabe „Erste“ erledigt' })
    fireEvent.click(box)
    expect(box).toBeChecked()
    expect(titles()).toEqual(['Zweite', 'Erste'])
    fireEvent.click(box)
    expect(box).not.toBeChecked()
  })

  it('renames a task (AC-10)', () => {
    renderView()
    addTask('Erste')
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Erste“ bearbeiten' }))
    const input = screen.getByRole('textbox', { name: /bearbeiten/ })
    fireEvent.change(input, { target: { value: 'Geändert' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(titles()).toEqual(['Geändert'])
  })
})

describe('deleting', () => {
  it('deletes at once and offers "Rückgängig" (AC-15)', () => {
    renderView()
    addTask('Erste')
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Erste“ löschen' }))
    expect(titles()).toEqual([])
    expect(screen.getByText('Aufgabe gelöscht')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rückgängig' })).toBeInTheDocument()
  })

  it('puts the task back at its place and returns focus to it (AC-16)', async () => {
    renderView()
    addTask('Erste')
    addTask('Zweite')
    addTask('Dritte')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Aufgabe „Zweite“ erledigt' }))
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Zweite“ löschen' }))
    expect(titles()).toEqual(['Dritte', 'Erste'])

    fireEvent.click(screen.getByRole('button', { name: 'Rückgängig' }))

    expect(titles()).toEqual(['Dritte', 'Zweite', 'Erste'])
    expect(screen.getByRole('checkbox', { name: 'Aufgabe „Zweite“ erledigt' })).toBeChecked()
    await vi.waitFor(() =>
      expect(screen.getByRole('checkbox', { name: 'Aufgabe „Zweite“ erledigt' })).toHaveFocus(),
    )
    expect(screen.queryByText('Aufgabe gelöscht')).not.toBeInTheDocument()
  })

  it('removes the notice after 6 seconds and keeps the task deleted (AC-17)', () => {
    vi.useFakeTimers()
    renderView()
    addTask('Erste')
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Erste“ löschen' }))

    act(() => {
      vi.advanceTimersByTime(6000)
    })

    expect(screen.queryByText('Aufgabe gelöscht')).not.toBeInTheDocument()
    expect(titles()).toEqual([])
  })

  it('shows only one notice; the older deletion is final (EC-5)', () => {
    renderView()
    addTask('Erste')
    addTask('Zweite')
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Zweite“ löschen' }))
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Erste“ löschen' }))

    expect(screen.getAllByText('Aufgabe gelöscht')).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Rückgängig' })).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Rückgängig' }))
    expect(titles()).toEqual(['Erste'])
  })

  it('keeps a deleted task deleted after a reload (EC-6)', () => {
    renderView()
    addTask('Erste')
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Erste“ löschen' }))
    render(<TasksView store={createTasksStore()} />)
    expect(screen.getAllByText('Noch keine Aufgaben. Schreib die erste.').length).toBeGreaterThan(0)
  })

  it('puts the focus back into the input after the last task is deleted (AC-25)', () => {
    renderView()
    addTask('Erste')
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Erste“ löschen' }))
    expect(screen.getByRole('textbox', { name: 'Neue Aufgabe' })).toHaveFocus()
  })

  it('places the "Rückgängig" button after the list in the page order (AC-25)', () => {
    renderView()
    addTask('Erste')
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Erste“ löschen' }))
    addTask('Zweite')
    const list = screen.getByRole('list')
    const undo = screen.getByRole('button', { name: 'Rückgängig' })
    expect(list.compareDocumentPosition(undo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

describe('other tabs', () => {
  it('shows what another tab changed (AC-19)', () => {
    renderView()
    act(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, tasks: [{ id: 'x', title: 'Aus Tab B', done: false }] }),
      )
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
    })
    expect(titles()).toEqual(['Aus Tab B'])
  })

  it('tells the person when a task was deleted in another tab and does not bring it back (EC-4)', () => {
    renderView()
    addTask('Erste')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks: [] }))

    fireEvent.click(screen.getByRole('checkbox', { name: 'Aufgabe „Erste“ erledigt' }))

    expect(screen.getByText('Diese Aufgabe existiert nicht mehr.')).toBeInTheDocument()
    expect(within(document.body).queryAllByRole('listitem')).toEqual([])
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').tasks).toEqual([])
  })
})

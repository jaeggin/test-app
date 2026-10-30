import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY, createTasksStore } from './tasks.storage'
import { useTasks } from './use-tasks'

function stored() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')?.tasks as
    | { id: string; title: string; done: boolean }[]
    | undefined
}

function setup() {
  const store = createTasksStore()
  const hook = renderHook(() => useTasks(store))
  return { store, ...hook }
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useTasks', () => {
  it('starts loaded and empty (AC-22)', () => {
    const { result } = setup()
    expect(result.current.loaded).toBe(true)
    expect(result.current.tasks).toEqual([])
  })

  it('adds new tasks on top and stores them (AC-2, AC-18)', () => {
    const { result } = setup()
    act(() => {
      result.current.add('Erste')
      result.current.add('Zweite')
    })
    expect(result.current.tasks.map((task) => task.title)).toEqual(['Zweite', 'Erste'])
    expect(stored()?.map((task) => task.title)).toEqual(['Zweite', 'Erste'])
  })

  it('gives every task its own id, also for duplicate titles (AC-6)', () => {
    const { result } = setup()
    act(() => {
      result.current.add('Anrufen')
      result.current.add('Anrufen')
    })
    const ids = result.current.tasks.map((task) => task.id)
    expect(new Set(ids).size).toBe(2)
  })

  it('reports an invalid title and changes nothing (AC-3, AC-12)', () => {
    const { result } = setup()
    let outcome: unknown
    act(() => {
      outcome = result.current.add('   ')
    })
    expect(outcome).toEqual({ ok: false, reason: 'empty' })
    expect(result.current.tasks).toEqual([])
    expect(stored()).toBeUndefined()
  })

  it('toggles done and back, keeping the position (AC-7, AC-8)', () => {
    const { result } = setup()
    act(() => {
      result.current.add('Erste')
      result.current.add('Zweite')
    })
    const firstId = result.current.tasks[1].id
    act(() => {
      result.current.toggle(firstId)
    })
    expect(result.current.tasks.map((task) => [task.title, task.done])).toEqual([
      ['Zweite', false],
      ['Erste', true],
    ])
    act(() => {
      result.current.toggle(firstId)
    })
    expect(result.current.tasks[1].done).toBe(false)
  })

  it('renames a task (AC-10)', () => {
    const { result } = setup()
    act(() => {
      result.current.add('Erste')
    })
    const id = result.current.tasks[0].id
    act(() => {
      result.current.rename(id, ' Geändert ')
    })
    expect(result.current.tasks[0].title).toBe('Geändert')
    expect(stored()?.[0].title).toBe('Geändert')
  })

  it('deletes at once and stores the deletion (AC-15)', () => {
    const { result } = setup()
    act(() => {
      result.current.add('Erste')
    })
    const id = result.current.tasks[0].id
    act(() => {
      result.current.remove(id)
    })
    expect(result.current.tasks).toEqual([])
    expect(stored()).toEqual([])
  })

  it('puts a deleted task back at its old position with its done state (AC-16)', () => {
    const { result } = setup()
    act(() => {
      result.current.add('Erste')
      result.current.add('Zweite')
      result.current.add('Dritte')
    })
    const middle = result.current.tasks[1]
    act(() => {
      result.current.toggle(middle.id)
    })
    let undo: () => void = () => {}
    act(() => {
      const outcome = result.current.remove(middle.id)
      if (outcome.ok) undo = outcome.undo
    })
    expect(result.current.tasks.map((task) => task.title)).toEqual(['Dritte', 'Erste'])
    act(() => {
      undo()
    })
    expect(result.current.tasks.map((task) => [task.title, task.done])).toEqual([
      ['Dritte', false],
      ['Zweite', true],
      ['Erste', false],
    ])
  })

  it('keeps a deleted task deleted after a reload when nobody undid it (AC-17, EC-6)', () => {
    const { result } = setup()
    act(() => {
      result.current.add('Erste')
    })
    act(() => {
      result.current.remove(result.current.tasks[0].id)
    })
    const reloaded = renderHook(() => useTasks(createTasksStore()))
    expect(reloaded.result.current.tasks).toEqual([])
  })
})

describe('several tabs', () => {
  it('does not lose a change another tab made to a different task (AC-19)', () => {
    const { result } = setup()
    act(() => {
      result.current.add('Erste')
      result.current.add('Zweite')
    })
    // Another tab renames the first task directly in the storage; this tab has not heard yet.
    const doc = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    doc.tasks[1].title = 'Anderer Tab'
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc))

    act(() => {
      result.current.toggle(result.current.tasks[0].id)
    })

    expect(stored()?.map((task) => [task.title, task.done])).toEqual([
      ['Zweite', true],
      ['Anderer Tab', false],
    ])
  })

  it('lets the last save win on the same task (AC-20)', () => {
    const { result } = setup()
    act(() => {
      result.current.add('Erste')
    })
    const id = result.current.tasks[0].id
    const doc = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    doc.tasks[0].title = 'Von Tab B'
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc))

    act(() => {
      result.current.rename(id, 'Von Tab A')
    })

    expect(stored()?.[0].title).toBe('Von Tab A')
  })

  it('does not bring back a task another tab deleted (EC-4)', () => {
    const { result } = setup()
    act(() => {
      result.current.add('Erste')
    })
    const id = result.current.tasks[0].id
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks: [] }))

    let outcome: unknown
    act(() => {
      outcome = result.current.rename(id, 'Neuer Titel')
    })

    expect(outcome).toEqual({ ok: false, reason: 'not-found' })
    expect(stored()).toEqual([])
    expect(result.current.tasks).toEqual([])
  })

  it('shows what another tab changed after its storage event (AC-19)', () => {
    const { result } = setup()
    act(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, tasks: [{ id: 'x', title: 'Aus Tab B', done: false }] }),
      )
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
    })
    expect(result.current.tasks.map((task) => task.title)).toEqual(['Aus Tab B'])
  })
})

describe('storage problems (AC-21)', () => {
  it('keeps working in memory and reports the storage as unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    const { result } = setup()
    expect(result.current.storage).toBe('unavailable')
    act(() => {
      result.current.add('Nur im Speicher')
    })
    expect(result.current.tasks.map((task) => task.title)).toEqual(['Nur im Speicher'])
  })

  it('reports unreadable stored data (EC-7)', () => {
    localStorage.setItem(STORAGE_KEY, '{kaputt')
    const { result } = setup()
    expect(result.current.unreadable).toBe(true)
    expect(result.current.tasks).toEqual([])
  })
})

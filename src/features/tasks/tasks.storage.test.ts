import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BACKUP_KEY, STORAGE_KEY, createTasksStore } from './tasks.storage'
import type { Task } from './tasks.schema'

const tasks: Task[] = [
  { id: 'a', title: 'Erste', done: false },
  { id: 'b', title: 'Zweite', done: true },
]

function storeDocument(list: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks: list }))
}

function storageEvent(key: string | null) {
  window.dispatchEvent(new StorageEvent('storage', { key }))
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('loading', () => {
  it('serves a loading state for the server render (AC-23)', () => {
    const store = createTasksStore()
    expect(store.getServerSnapshot().loaded).toBe(false)
  })

  it('starts with an empty, loaded list when nothing is stored', () => {
    const store = createTasksStore()
    expect(store.getSnapshot()).toEqual({ loaded: true, tasks: [], storage: 'ok', unreadable: false })
  })

  it('reads a stored document (AC-18)', () => {
    storeDocument(tasks)
    const store = createTasksStore()
    expect(store.getSnapshot().tasks).toEqual(tasks)
  })

  it('returns the same snapshot object until something changes', () => {
    const store = createTasksStore()
    expect(store.getSnapshot()).toBe(store.getSnapshot())
  })
})

describe('writing', () => {
  it('stores one versioned document with the list in order (AC-18)', () => {
    const store = createTasksStore()
    store.write(tasks)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual({ version: 1, tasks })
  })

  it('survives a reload: a new store reads what the old one wrote (AC-18)', () => {
    createTasksStore().write(tasks)
    expect(createTasksStore().getSnapshot().tasks).toEqual(tasks)
  })

  it('tells subscribers about a write', () => {
    const store = createTasksStore()
    const listener = vi.fn()
    store.subscribe(listener)
    store.write(tasks)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot().tasks).toEqual(tasks)
  })

  it('stops telling a subscriber that unsubscribed', () => {
    const store = createTasksStore()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    unsubscribe()
    store.write(tasks)
    expect(listener).not.toHaveBeenCalled()
  })
})

describe('other tabs', () => {
  it('shows a change made in another tab after its storage event (AC-19)', () => {
    const store = createTasksStore()
    const listener = vi.fn()
    store.subscribe(listener)
    store.getSnapshot()

    storeDocument(tasks)
    storageEvent(STORAGE_KEY)

    expect(listener).toHaveBeenCalled()
    expect(store.getSnapshot().tasks).toEqual(tasks)
  })

  it('shows an empty list when another tab clears the storage (AC-19)', () => {
    storeDocument(tasks)
    const store = createTasksStore()
    store.subscribe(() => {})
    store.getSnapshot()

    localStorage.clear()
    storageEvent(null)

    expect(store.getSnapshot().tasks).toEqual([])
  })

  it('ignores events for other keys', () => {
    const store = createTasksStore()
    const listener = vi.fn()
    store.subscribe(listener)
    store.getSnapshot()

    storageEvent('theme')

    expect(listener).not.toHaveBeenCalled()
  })

  it('refresh returns the freshest list even without an event (AC-19, AC-20)', () => {
    const store = createTasksStore()
    store.getSnapshot()
    storeDocument(tasks)
    expect(store.refresh()).toEqual(tasks)
  })

  it('does not notify when a refresh finds nothing new', () => {
    storeDocument(tasks)
    const store = createTasksStore()
    store.getSnapshot()
    const listener = vi.fn()
    store.subscribe(listener)
    store.refresh()
    expect(listener).not.toHaveBeenCalled()
  })
})

describe('unreadable data (EC-7)', () => {
  it.each([
    ['broken JSON', '{not json'],
    ['a wrong shape', JSON.stringify({ version: 1, tasks: [{ id: 'a', title: '', done: false }] })],
  ])('shows an empty list and flags %s without touching it', (_name, raw) => {
    localStorage.setItem(STORAGE_KEY, raw)
    const store = createTasksStore()
    const state = store.getSnapshot()
    expect(state.tasks).toEqual([])
    expect(state.unreadable).toBe(true)
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw)
  })

  it('parks the unreadable data under the backup key before the first write', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    const store = createTasksStore()
    store.getSnapshot()

    store.write(tasks)

    expect(localStorage.getItem(BACKUP_KEY)).toBe('{not json')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual({ version: 1, tasks })
  })

  it('keeps the notice for the rest of the session after the first write', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    const store = createTasksStore()
    store.getSnapshot()
    store.write(tasks)
    expect(store.getSnapshot().unreadable).toBe(true)
  })
})

describe('storage not available or full (AC-21)', () => {
  it('stays usable in memory when the storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    const store = createTasksStore()
    expect(store.getSnapshot().storage).toBe('unavailable')

    store.write(tasks)

    expect(store.getSnapshot().tasks).toEqual(tasks)
    expect(store.refresh()).toEqual(tasks)
  })

  it('flags the storage as unavailable when a write fails, and keeps the change in memory', () => {
    const store = createTasksStore()
    store.getSnapshot()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })

    store.write(tasks)

    expect(store.getSnapshot().storage).toBe('unavailable')
    expect(store.getSnapshot().tasks).toEqual(tasks)
  })

  it('does not replace newer in-memory changes with older stored data after a failed write', () => {
    storeDocument([tasks[0]])
    const store = createTasksStore()
    store.getSnapshot()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    store.write(tasks)

    expect(store.refresh()).toEqual(tasks)
  })
})

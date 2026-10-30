import { tasksDocumentSchema, type Task } from './tasks.schema'

export const STORAGE_KEY = 'tasks:v1'
export const BACKUP_KEY = 'tasks:v1:backup'
const PROBE_KEY = 'tasks:probe'

export type TasksState = {
  /** False on the server and until the browser storage has been read (AC-23). */
  loaded: boolean
  tasks: Task[]
  /** 'unavailable': storage is blocked or full, changes live in memory only (AC-21). */
  storage: 'ok' | 'unavailable'
  /** True for the rest of the session once stored data could not be read (EC-7). */
  unreadable: boolean
}

const LOADING_STATE: TasksState = { loaded: false, tasks: [], storage: 'ok', unreadable: false }

type ReadResult = { unreadable: false; tasks: Task[] } | { unreadable: true; raw: string }

function readDocument(storage: Storage): ReadResult {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) return { unreadable: false, tasks: [] }
  try {
    const parsed = tasksDocumentSchema.safeParse(JSON.parse(raw))
    if (parsed.success) return { unreadable: false, tasks: parsed.data.tasks }
  } catch {
    // not valid JSON: handled as unreadable below
  }
  return { unreadable: true, raw }
}

function probeStorage(): Storage | null {
  try {
    const storage = window.localStorage
    storage.setItem(PROBE_KEY, '1')
    storage.removeItem(PROBE_KEY)
    return storage
  } catch {
    return null
  }
}

/**
 * The in-memory copy is what the UI shows; the browser storage is its mirror.
 * Shaped for useSyncExternalStore: getSnapshot only returns a new object when something changed.
 */
export function createTasksStore() {
  let state = LOADING_STATE
  let storage: Storage | null = null
  let initialized = false
  let backupRaw: string | null = null
  const listeners = new Set<() => void>()

  function notify() {
    listeners.forEach((listener) => listener())
  }

  function applyRead(result: ReadResult) {
    if (result.unreadable) {
      backupRaw = result.raw
      state = { ...state, tasks: [], unreadable: true }
    } else {
      state = { ...state, tasks: result.tasks }
    }
  }

  function init() {
    if (initialized || typeof window === 'undefined') return
    initialized = true
    storage = probeStorage()
    state = { loaded: true, tasks: [], storage: storage ? 'ok' : 'unavailable', unreadable: false }
    if (!storage) return
    try {
      applyRead(readDocument(storage))
    } catch {
      state = { ...state, storage: 'unavailable' }
    }
  }

  /** Re-reads the browser storage and returns the freshest list. Notifies if it changed. */
  function refresh(): Task[] {
    init()
    // Once storage failed, the in-memory copy is ahead of it and must not be overwritten.
    if (storage && state.storage === 'ok') {
      const before = state
      try {
        applyRead(readDocument(storage))
      } catch {
        state = { ...state, storage: 'unavailable' }
      }
      const changed =
        state.storage !== before.storage ||
        state.unreadable !== before.unreadable ||
        JSON.stringify(state.tasks) !== JSON.stringify(before.tasks)
      if (changed) notify()
      else state = before
    }
    return state.tasks
  }

  /** Makes this list the truth: shown at once, mirrored to the browser storage if possible. */
  function write(tasks: Task[]) {
    init()
    let storageStatus = state.storage
    if (storage && storageStatus === 'ok') {
      try {
        // Unreadable data is parked under the backup key before it is overwritten (EC-7).
        if (backupRaw !== null) {
          storage.setItem(BACKUP_KEY, backupRaw)
          backupRaw = null
        }
        storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks }))
      } catch {
        storageStatus = 'unavailable'
      }
    }
    state = { ...state, tasks, storage: storageStatus }
    notify()
  }

  function onStorageEvent(event: StorageEvent) {
    // key === null means another tab cleared the whole storage.
    if (event.key === null || event.key === STORAGE_KEY) refresh()
  }

  function subscribe(listener: () => void) {
    if (listeners.size === 0) window.addEventListener('storage', onStorageEvent)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) window.removeEventListener('storage', onStorageEvent)
    }
  }

  function getSnapshot(): TasksState {
    init()
    return state
  }

  function getServerSnapshot(): TasksState {
    return LOADING_STATE
  }

  return { subscribe, getSnapshot, getServerSnapshot, refresh, write }
}

export type TasksStore = ReturnType<typeof createTasksStore>

export const tasksStore = createTasksStore()

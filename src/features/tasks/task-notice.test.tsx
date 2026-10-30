import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskNotice, type Notice } from './task-notice'

const deleted = (run = vi.fn()): Notice => ({
  id: 1,
  message: 'Aufgabe gelöscht',
  action: { label: 'Rückgängig', run },
})

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('TaskNotice', () => {
  it('shows the message with a working "Rückgängig" button (AC-15)', () => {
    const run = vi.fn()
    const onDismiss = vi.fn()
    render(<TaskNotice notice={deleted(run)} onDismiss={onDismiss} />)

    expect(screen.getByText('Aufgabe gelöscht')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Rückgängig' }))

    expect(run).toHaveBeenCalledTimes(1)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('goes away after 6 seconds, not before (AC-15, AC-17)', () => {
    const onDismiss = vi.fn()
    render(<TaskNotice notice={deleted()} onDismiss={onDismiss} />)

    act(() => {
      vi.advanceTimersByTime(5999)
    })
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('restarts the 6 seconds when a newer notice replaces it (EC-5)', () => {
    const onDismiss = vi.fn()
    const { rerender } = render(<TaskNotice notice={deleted()} onDismiss={onDismiss} />)

    act(() => {
      vi.advanceTimersByTime(4000)
    })
    rerender(<TaskNotice notice={{ ...deleted(), id: 2, message: 'Zweite gelöscht' }} onDismiss={onDismiss} />)
    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.getByText('Zweite gelöscht')).toBeInTheDocument()
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('shows only the newest notice (EC-5)', () => {
    const { rerender } = render(<TaskNotice notice={deleted()} onDismiss={() => {}} />)
    rerender(<TaskNotice notice={{ id: 2, message: 'Zweite gelöscht' }} onDismiss={() => {}} />)
    expect(screen.queryByText('Aufgabe gelöscht')).not.toBeInTheDocument()
    expect(screen.getByText('Zweite gelöscht')).toBeInTheDocument()
  })

  it('shows a plain message without a button (EC-4)', () => {
    render(<TaskNotice notice={{ id: 3, message: 'Diese Aufgabe existiert nicht mehr.' }} onDismiss={() => {}} />)
    expect(screen.getByText('Diese Aufgabe existiert nicht mehr.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('keeps an empty live region so screen readers announce the next notice', () => {
    render(<TaskNotice notice={null} onDismiss={() => {}} />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('does not run a timer without a notice', () => {
    const onDismiss = vi.fn()
    render(<TaskNotice notice={null} onDismiss={onDismiss} />)
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(onDismiss).not.toHaveBeenCalled()
  })
})

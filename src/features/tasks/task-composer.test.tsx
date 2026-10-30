import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TaskComposer } from './task-composer'
import type { ActionResult } from './use-tasks'

function setup(onAdd: (title: string) => ActionResult = () => ({ ok: true })) {
  const inputRef = createRef<HTMLInputElement>()
  const handler = vi.fn(onAdd)
  render(<TaskComposer onAdd={handler} inputRef={inputRef} />)
  const input = screen.getByRole('textbox', { name: 'Neue Aufgabe' }) as HTMLInputElement
  return { input, handler, inputRef }
}

function type(input: HTMLInputElement, value: string) {
  fireEvent.change(input, { target: { value } })
}

describe('TaskComposer', () => {
  it('has focus on the input when it appears (AC-1)', () => {
    const { input } = setup()
    expect(input).toHaveFocus()
  })

  it('adds with Enter, empties the field and keeps the focus (AC-2)', () => {
    const { input, handler } = setup()
    type(input, 'Anrufen')
    fireEvent.submit(input.closest('form')!)
    expect(handler).toHaveBeenCalledWith('Anrufen')
    expect(input.value).toBe('')
    expect(input).toHaveFocus()
  })

  it('adds with the "Hinzufügen" button (AC-2)', () => {
    const { input, handler } = setup()
    type(input, 'Anrufen')
    fireEvent.click(screen.getByRole('button', { name: 'Hinzufügen' }))
    expect(handler).toHaveBeenCalledWith('Anrufen')
  })

  it('shows a hint instead of silently doing nothing on an empty title (AC-3)', () => {
    const { input } = setup((title) =>
      title.trim() === '' ? { ok: false, reason: 'empty' } : { ok: true },
    )
    type(input, '   ')
    fireEvent.submit(input.closest('form')!)
    expect(screen.getByText('Bitte einen Titel eingeben.')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('removes the hint once the person types again (AC-3)', () => {
    const { input } = setup(() => ({ ok: false, reason: 'empty' }))
    fireEvent.submit(input.closest('form')!)
    expect(screen.getByText('Bitte einen Titel eingeben.')).toBeInTheDocument()
    type(input, 'a')
    expect(screen.queryByText('Bitte einen Titel eingeben.')).not.toBeInTheDocument()
  })

  it('limits the input to 200 characters (AC-4)', () => {
    const { input } = setup()
    expect(input).toHaveAttribute('maxlength', '200')
  })

  it('creates only one task when Enter is pressed twice in a row (EC-3)', () => {
    const { input, handler } = setup((title) =>
      title.trim() === '' ? { ok: false, reason: 'empty' } : { ok: true },
    )
    type(input, 'Einmal')
    const form = input.closest('form')!
    fireEvent.submit(form)
    fireEvent.submit(form)
    const created = handler.mock.results.filter((r) => r.value.ok)
    expect(created).toHaveLength(1)
  })

  it('keeps the typed text when the add fails', () => {
    const { input } = setup(() => ({ ok: false, reason: 'too-long' }))
    type(input, 'Text')
    fireEvent.submit(input.closest('form')!)
    expect(input.value).toBe('Text')
    expect(screen.getByText('Der Titel darf höchstens 200 Zeichen lang sein.')).toBeInTheDocument()
  })

  it('is reachable by keyboard: input and button are real form controls (AC-25)', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Hinzufügen' })).toHaveAttribute('type', 'submit')
  })
})

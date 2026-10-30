import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TaskItem } from './task-item'
import type { Task } from './tasks.schema'
import type { ActionResult } from './use-tasks'

const open: Task = { id: 'a', title: 'Anrufen', done: false }
const done: Task = { id: 'b', title: 'Erledigt', done: true }

function setup(task: Task = open, rename: (id: string, title: string) => ActionResult = () => ({ ok: true })) {
  const onToggle = vi.fn()
  const onRename = vi.fn(rename)
  const onDelete = vi.fn()
  const view = render(
    <ul>
      <TaskItem task={task} onToggle={onToggle} onRename={onRename} onDelete={onDelete} />
    </ul>,
  )
  return { onToggle, onRename, onDelete, ...view }
}

const editButton = (title: string) => screen.getByRole('button', { name: `Aufgabe „${title}“ bearbeiten` })

describe('TaskItem display', () => {
  it('shows an open task as normal text with an unchecked box (AC-7)', () => {
    setup()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
    expect(screen.getByText('Anrufen')).not.toHaveClass('line-through')
  })

  it('shows a done task struck through in muted grey, with a checked box (AC-7)', () => {
    setup(done)
    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(screen.getByText('Erledigt')).toHaveClass('line-through', 'text-muted-foreground')
  })

  it('wraps long titles instead of scrolling sideways (EC-1)', () => {
    const long = { id: 'l', title: 'a'.repeat(200), done: false }
    setup(long)
    expect(screen.getByText('a'.repeat(200))).toHaveClass('break-words', 'min-w-0')
  })

  it('shows markup in a title as plain text (EC-2)', () => {
    const title = '<script>alert(1)</script><b>fett</b>'
    const { container } = setup({ id: 'x', title, done: false })
    expect(screen.getByText(title)).toBeInTheDocument()
    expect(container.querySelector('script, b')).toBeNull()
  })

  it('gives every control a name that says which task it belongs to (AC-25)', () => {
    setup()
    expect(screen.getByRole('checkbox', { name: 'Aufgabe „Anrufen“ erledigt' })).toBeInTheDocument()
    expect(editButton('Anrufen')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aufgabe „Anrufen“ löschen' })).toBeInTheDocument()
  })
})

describe('TaskItem actions', () => {
  it('toggles through the box (AC-7, AC-8)', () => {
    const { onToggle } = setup()
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('a')
  })

  it('does nothing when the title text is clicked (AC-14)', () => {
    const { onToggle, onRename, onDelete } = setup()
    fireEvent.click(screen.getByText('Anrufen'))
    expect(onToggle).not.toHaveBeenCalled()
    expect(onRename).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('deletes through the bin button (AC-15)', () => {
    const { onDelete } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe „Anrufen“ löschen' }))
    expect(onDelete).toHaveBeenCalledWith('a')
  })
})

describe('TaskItem editing', () => {
  it('turns the title into a focused field holding the current title (AC-9)', () => {
    setup()
    fireEvent.click(editButton('Anrufen'))
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('Anrufen')
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('maxlength', '200')
  })

  it('saves with Enter, closes the field and returns focus to the pencil (AC-10)', () => {
    const { onRename } = setup()
    fireEvent.click(editButton('Anrufen'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Zurückrufen' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onRename).toHaveBeenCalledTimes(1)
    expect(onRename).toHaveBeenCalledWith('a', 'Zurückrufen')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(editButton('Anrufen')).toHaveFocus()
  })

  it('saves when the field is left (AC-10)', () => {
    const { onRename } = setup()
    fireEvent.click(editButton('Anrufen'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Zurückrufen' } })
    fireEvent.blur(input)
    expect(onRename).toHaveBeenCalledWith('a', 'Zurückrufen')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('saves only once when Enter is followed by a blur (AC-10)', () => {
    const { onRename } = setup()
    fireEvent.click(editButton('Anrufen'))
    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.blur(input)
    expect(onRename).toHaveBeenCalledTimes(1)
  })

  it('discards with Esc and keeps the old title (AC-11)', () => {
    const { onRename } = setup()
    fireEvent.click(editButton('Anrufen'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Verworfen' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    fireEvent.blur(input)
    expect(onRename).not.toHaveBeenCalled()
    expect(screen.getByText('Anrufen')).toBeInTheDocument()
  })

  it('stays open with a hint when the title is empty, until Esc (AC-12)', () => {
    const { onRename } = setup(open, () => ({ ok: false, reason: 'empty' }))
    fireEvent.click(editButton('Anrufen'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '  ' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onRename).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Bitte einen Titel eingeben.')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' })
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText('Anrufen')).toBeInTheDocument()
  })

  it('also stays open when the empty title comes from leaving the field (AC-12)', () => {
    setup(open, () => ({ ok: false, reason: 'empty' }))
    fireEvent.click(editButton('Anrufen'))
    fireEvent.blur(screen.getByRole('textbox'))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('lets a done task be edited (AC-13)', () => {
    setup(done)
    fireEvent.click(editButton('Erledigt'))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('closes the field when the task no longer exists (EC-4)', () => {
    setup(open, () => ({ ok: false, reason: 'not-found' }))
    fireEvent.click(editButton('Anrufen'))
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})

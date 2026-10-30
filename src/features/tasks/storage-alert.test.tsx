import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StorageAlert } from './storage-alert'

describe('StorageAlert', () => {
  it('shows nothing when storage works and data is readable', () => {
    const { container } = render(<StorageAlert storage="ok" unreadable={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('says that changes are not saved when the storage is unavailable (AC-21)', () => {
    render(<StorageAlert storage="unavailable" unreadable={false} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Änderungen werden nicht gespeichert.')
  })

  it('says that stored tasks could not be read (EC-7)', () => {
    render(<StorageAlert storage="ok" unreadable />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Gespeicherte Aufgaben konnten nicht gelesen werden.',
    )
  })

  it('shows both messages when both problems exist', () => {
    render(<StorageAlert storage="unavailable" unreadable />)
    expect(screen.getAllByRole('alert')).toHaveLength(2)
  })
})

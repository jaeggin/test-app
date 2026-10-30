import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const themeState = vi.hoisted(() => ({
  resolvedTheme: 'light' as string | undefined,
  setTheme: vi.fn(),
}))

vi.mock('next-themes', () => ({
  useTheme: () => themeState,
}))

import { AppHeader } from './app-header'
import { ThemeToggle } from './theme-toggle'

const toggleName = 'Zwischen hellem und dunklem Modus umschalten'

describe('ThemeToggle', () => {
  beforeEach(() => {
    themeState.setTheme.mockReset()
    themeState.resolvedTheme = 'light'
  })

  it('switches from light to dark (AC-24)', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: toggleName }))
    expect(themeState.setTheme).toHaveBeenCalledWith('dark')
  })

  it('switches from dark to light (AC-24)', () => {
    themeState.resolvedTheme = 'dark'
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: toggleName }))
    expect(themeState.setTheme).toHaveBeenCalledWith('light')
  })
})

describe('AppHeader', () => {
  it('shows the app title and the theme toggle (AC-24)', () => {
    render(<AppHeader />)
    expect(screen.getByText('Aufgaben')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: toggleName })).toBeInTheDocument()
  })

  it('puts the title before the toggle in reading order (AC-24)', () => {
    render(<AppHeader />)
    const title = screen.getByText('Aufgaben')
    const toggle = screen.getByRole('button', { name: toggleName })
    expect(title.compareDocumentPosition(toggle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

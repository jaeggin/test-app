import { act, render } from '@testing-library/react'
import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from './theme-provider'

function stubSystemTheme(dark: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('dark') ? dark : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
}

let setThemeFromChild: (theme: string) => void = () => {}

function Probe() {
  const { setTheme } = useTheme()
  useEffect(() => {
    setThemeFromChild = setTheme
  }, [setTheme])
  return null
}

function renderProvider() {
  return render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
  document.documentElement.removeAttribute('style')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ThemeProvider (real next-themes)', () => {
  it('follows a dark system setting when nothing was chosen (AC-24)', () => {
    stubSystemTheme(true)
    renderProvider()
    expect(document.documentElement).toHaveClass('dark')
  })

  it('follows a light system setting when nothing was chosen (AC-24)', () => {
    stubSystemTheme(false)
    renderProvider()
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('stores a manual choice under "theme" and applies it over the system setting (AC-24)', () => {
    stubSystemTheme(false)
    renderProvider()
    act(() => {
      setThemeFromChild('dark')
    })
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')
  })

  it('keeps a stored manual choice after a reload, against the system setting (AC-24)', () => {
    stubSystemTheme(true)
    localStorage.setItem('theme', 'light')
    renderProvider()
    expect(document.documentElement).not.toHaveClass('dark')
  })
})

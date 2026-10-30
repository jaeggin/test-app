import { describe, expect, it } from 'vitest'
import {
  TITLE_MAX_LENGTH,
  normalizeTitle,
  parseTitle,
  tasksDocumentSchema,
} from './tasks.schema'

describe('parseTitle', () => {
  it('trims spaces at both ends (AC-5)', () => {
    expect(parseTitle('  Anrufen  ')).toEqual({ ok: true, title: 'Anrufen' })
  })

  it('rejects an empty title (AC-3)', () => {
    expect(parseTitle('')).toEqual({ ok: false, reason: 'empty' })
  })

  it('rejects a title of only spaces (AC-3, AC-12)', () => {
    expect(parseTitle('   \t  ')).toEqual({ ok: false, reason: 'empty' })
  })

  it('accepts exactly 200 characters (AC-4)', () => {
    const title = 'a'.repeat(TITLE_MAX_LENGTH)
    expect(parseTitle(title)).toEqual({ ok: true, title })
  })

  it('rejects 201 characters (AC-4)', () => {
    expect(parseTitle('a'.repeat(TITLE_MAX_LENGTH + 1))).toEqual({ ok: false, reason: 'too-long' })
  })

  it('counts the length after trimming', () => {
    const title = 'a'.repeat(TITLE_MAX_LENGTH)
    expect(parseTitle(`  ${title}  `)).toEqual({ ok: true, title })
  })

  it('turns pasted line breaks into spaces so the title stays one line', () => {
    expect(parseTitle('Milch\nBrot\r\nEier')).toEqual({ ok: true, title: 'Milch Brot Eier' })
  })

  it('keeps special characters as they are (EC-2)', () => {
    expect(parseTitle('<script>alert(1)</script>')).toEqual({
      ok: true,
      title: '<script>alert(1)</script>',
    })
  })
})

describe('normalizeTitle', () => {
  it('leaves an already normal title unchanged', () => {
    expect(normalizeTitle('Anrufen')).toBe('Anrufen')
  })
})

describe('tasksDocumentSchema', () => {
  const valid = {
    version: 1,
    tasks: [
      { id: 'a', title: 'Erste', done: false },
      { id: 'b', title: 'Zweite', done: true },
    ],
  }

  it('accepts a valid document', () => {
    expect(tasksDocumentSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts an empty list', () => {
    expect(tasksDocumentSchema.safeParse({ version: 1, tasks: [] }).success).toBe(true)
  })

  it('rejects a missing or wrong version (EC-7)', () => {
    expect(tasksDocumentSchema.safeParse({ tasks: [] }).success).toBe(false)
    expect(tasksDocumentSchema.safeParse({ version: 2, tasks: [] }).success).toBe(false)
  })

  it('rejects a task with a wrong type (EC-7)', () => {
    const doc = { version: 1, tasks: [{ id: 'a', title: 'Erste', done: 'yes' }] }
    expect(tasksDocumentSchema.safeParse(doc).success).toBe(false)
  })

  it('rejects an empty or too long stored title (EC-7)', () => {
    const empty = { version: 1, tasks: [{ id: 'a', title: '', done: false }] }
    const long = { version: 1, tasks: [{ id: 'a', title: 'a'.repeat(201), done: false }] }
    expect(tasksDocumentSchema.safeParse(empty).success).toBe(false)
    expect(tasksDocumentSchema.safeParse(long).success).toBe(false)
  })

  it('rejects a stored title that is not trimmed (EC-7)', () => {
    const doc = { version: 1, tasks: [{ id: 'a', title: ' Erste', done: false }] }
    expect(tasksDocumentSchema.safeParse(doc).success).toBe(false)
  })

  it('rejects duplicate ids (EC-7)', () => {
    const doc = {
      version: 1,
      tasks: [
        { id: 'a', title: 'Erste', done: false },
        { id: 'a', title: 'Zweite', done: false },
      ],
    }
    expect(tasksDocumentSchema.safeParse(doc).success).toBe(false)
  })

  it('rejects data that is not an object (EC-7)', () => {
    expect(tasksDocumentSchema.safeParse(null).success).toBe(false)
    expect(tasksDocumentSchema.safeParse('{}').success).toBe(false)
  })
})

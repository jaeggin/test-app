import { z } from 'zod'

export const TITLE_MAX_LENGTH = 200

/** Line breaks become spaces (a pasted text stays one line), then the edges are trimmed. */
export function normalizeTitle(raw: string): string {
  return raw.replace(/[\r\n]+/g, ' ').trim()
}

// A stored title is always in normalized form, so a hand-edited document is caught on read.
const titleSchema = z
  .string()
  .min(1)
  .max(TITLE_MAX_LENGTH)
  .refine((title) => title === normalizeTitle(title))

export const taskSchema = z.object({
  id: z.string().min(1),
  title: titleSchema,
  done: z.boolean(),
})

export const tasksDocumentSchema = z
  .object({
    version: z.literal(1),
    tasks: z.array(taskSchema),
  })
  .refine((doc) => new Set(doc.tasks.map((task) => task.id)).size === doc.tasks.length)

export type Task = z.infer<typeof taskSchema>
export type TasksDocument = z.infer<typeof tasksDocumentSchema>

export type TitleResult =
  | { ok: true; title: string }
  | { ok: false; reason: 'empty' | 'too-long' }

/** The one title rule for creating and editing (AC-3, AC-4, AC-5, AC-12). */
export function parseTitle(raw: string): TitleResult {
  const title = normalizeTitle(raw)
  if (title.length === 0) return { ok: false, reason: 'empty' }
  if (title.length > TITLE_MAX_LENGTH) return { ok: false, reason: 'too-long' }
  return { ok: true, title }
}

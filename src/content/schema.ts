import { z } from 'zod'

const text = z.string().trim().min(1, 'обязательный текст')
const id = text.regex(/^[a-z0-9][a-z0-9-]*$/, 'используйте латиницу, цифры и дефис')
const asset = z.string().regex(/^assets\/(?:[\w-]+\/)*[\w-]+\.(?:png|webp|jpg|svg)$/i, 'нужен локальный путь assets/…')
const source = z.object({
  sourceType: z.enum(['selfReported', 'colleague', 'fictional']),
  needsReview: z.boolean(),
  approvedForShow: z.boolean(),
  notesForOrganizer: text.optional(),
})
const fact = source.extend({ id, text, isFabricated: z.boolean() })
const evidence = source.extend({ id, title: text, text, icon: text })
const dialogue = z.array(z.object({ speaker: z.enum(['citizen', 'inspector']), text })).min(1)
const detail = z.object({ label: text, value: text })
const document = z.object({
  id,
  kind: z.enum(['passport', 'dossier', 'record', 'evidence', 'permit']),
  title: text,
  reference: text,
  text,
  details: z.array(detail).default([]),
  image: asset.optional(),
})
const commonScene = {
  id,
  title: text,
  subtitle: text,
  instruction: text,
  documentIds: z.array(id).min(1),
  dialogue,
  visitorFraming: z.literal('forehead').optional(),
  visitorBackdrop: z.literal('cockpit').optional(),
  optional: z.boolean().default(false),
  enabled: z.boolean().default(true),
}
const question = {
  prompt: text,
  answerId: id,
  correctFeedback: text,
  wrongFeedback: text,
  explanation: text,
}
const reconstruction = {
  route: z.object({ from: text, to: text, after: text, image: asset.optional() }).optional(),
  shore: z.object({ title: text, distance: text, bank: text, water: text }).optional(),
  parade: z.object({ title: text, location: text }).optional(),
  revealDialogue: dialogue,
}
const scene = z.discriminatedUnion('type', [
  z.object({ ...commonScene, ...question, type: z.literal('facts'), factIds: z.array(id).length(4) }),
  z.object({
    ...commonScene, ...question, ...reconstruction, type: z.literal('incident'),
    options: z.array(source.extend({ id, text })).length(3),
  }),
  z.object({
    ...commonScene, ...reconstruction, type: z.literal('discussion'),
    prompt: text,
    outcome: source.extend({ title: text, text }),
    afterNoteId: id.optional(),
  }),
  z.object({
    ...commonScene, type: z.literal('witness'), prompt: text,
    evidenceIds: z.array(id).min(2).max(3),
    answerIds: z.array(id).length(2),
    conclusion: text,
    alternateFeedback: text,
  }),
  z.object({ ...commonScene, type: z.literal('verdict'), charge: text, ruling: text }),
])

const identity = { id, displayName: text }
const profileSchema = z.discriminatedUnion('status', [
  z.object({ ...identity, status: z.literal('placeholder'), preparationNote: text }),
  z.object({
    ...identity,
    status: z.enum(['ready', 'demo']),
    caseNumber: text,
    portrait: asset.optional(),
    windowMark: z.string().trim().length(1).optional(),
    permitReason: text,
    intro: z.object({ title: text, notice: text, subject: text }),
    documents: z.array(document).min(1),
    facts: z.array(fact).default([]),
    evidence: z.array(evidence).default([]),
    scenes: z.array(scene).min(1),
    award: z.object({
      title: text,
      citation: text,
      greeting: text,
      motif: z.enum(['compass', 'star', 'laurel', 'fishing', 'truck']),
      image: asset.optional(),
    }),
  }),
])

export type Case = z.infer<typeof profileSchema>
export type PlayableCase = Exclude<Case, { status: 'placeholder' }>
export type Scene = z.infer<typeof scene>
export type Document = z.infer<typeof document>
export type Dialogue = z.infer<typeof dialogue>

const isApproved = (item: z.infer<typeof source>) => item.approvedForShow && !item.needsReview

export function validateCase(input: unknown): Case {
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(issue => `${issue.path.join('.') || 'дело'}: ${issue.message}`).join('\n'))
  }
  const profile = parsed.data
  if (profile.status === 'placeholder') return profile
  const errors: string[] = []
  const unique = (values: string[], path: string) => {
    const seen = new Set<string>()
    for (const value of values) {
      if (seen.has(value)) errors.push(`${path}: id «${value}» повторяется`)
      seen.add(value)
    }
  }
  const references = (values: string[], allowed: string[], path: string) => {
    unique(values, path)
    for (const value of values) {
      if (!allowed.includes(value)) errors.push(`${path}: неизвестный id «${value}»`)
    }
  }
  for (const key of ['scenes', 'documents', 'facts', 'evidence'] as const) {
    unique(profile[key].map(item => item.id), key)
  }
  const active = profile.scenes.filter(stage => stage.enabled)
  if (!active.length) errors.push('scenes: нужна хотя бы одна включённая сцена')
  if (active.slice(0, -1).some(stage => stage.type === 'verdict')) {
    errors.push('scenes: вердикт должен быть последней включённой сценой')
  }
  profile.scenes.forEach((stage, index) => {
    const path = `scenes.${index}`
    if (!stage.enabled && (!stage.optional || stage.type === 'verdict')) {
      errors.push(`${path}: отключать можно только необязательные сцены до вердикта`)
    }
    references(stage.documentIds, profile.documents.map(item => item.id), `${path}.documentIds`)
    if (stage.type === 'facts') {
      references(stage.factIds, profile.facts.map(item => item.id), `${path}.factIds`)
      const facts = profile.facts.filter(item => stage.factIds.includes(item.id))
      const fakes = facts.filter(item => item.isFabricated)
      if (fakes.length !== 1) errors.push(`${path}: в досье должна быть ровно одна подделка`)
      if (fakes.length === 1 && stage.answerId !== fakes[0].id) {
        errors.push(`${path}.answerId: укажите id единственной подделки`)
      }
      for (const item of facts) {
        if (item.isFabricated && item.sourceType === 'fictional') continue
        if (item.isFabricated || (item.sourceType === 'fictional' && profile.status === 'ready') || (stage.enabled && !isApproved(item))) {
          errors.push(`${path}.factIds: «${item.id}» нужно утвердить как реальный факт или отметить как выдумку`)
        }
      }
    }
    if (stage.type === 'incident') {
      const ids = stage.options.map(option => option.id)
      unique(ids, `${path}.options`)
      references([stage.answerId], ids, `${path}.answerId`)
      for (const option of stage.options) {
        const correct = option.id === stage.answerId
        if (correct && ((option.sourceType === 'fictional' && profile.status === 'ready') ||
          (stage.enabled && !isApproved(option)))) {
          errors.push(`${path}.answerId: настоящий исход нужно утвердить`)
        }
        if (!correct && option.sourceType !== 'fictional') {
          errors.push(`${path}.options: отвлекающий вариант «${option.id}» должен быть fictional`)
        }
      }
    }
    if (stage.type === 'discussion') {
      if (stage.enabled && (!isApproved(stage.outcome) || (profile.status === 'ready' && stage.outcome.sourceType === 'fictional'))) {
        errors.push(`${path}.outcome: итог истории нужно утвердить`)
      }
      if (stage.afterNoteId) {
        const note = profile.evidence.find(item => item.id === stage.afterNoteId)
        if (!note || (stage.enabled && (!isApproved(note) || (profile.status === 'ready' && note.sourceType === 'fictional')))) {
          errors.push(`${path}.afterNoteId: укажите id утверждённого показания`)
        }
      }
    }
    if (stage.type === 'witness') {
      references(stage.evidenceIds, profile.evidence.map(item => item.id), `${path}.evidenceIds`)
      references(stage.answerIds, stage.evidenceIds, `${path}.answerIds`)
      for (const item of profile.evidence.filter(item => stage.evidenceIds.includes(item.id))) {
        if (stage.enabled && (!isApproved(item) || (profile.status === 'ready' && item.sourceType === 'fictional'))) {
          errors.push(`${path}.evidenceIds: показание «${item.id}» нужно утвердить`)
        }
      }
    }
  })
  if (errors.length) throw new Error(errors.join('\n'))
  return profile
}

export function parseCases(files: Record<string, unknown>): Case[] {
  const seen = new Set<string>()
  return Object.entries(files).map(([key, data]) => {
    try {
      const profile = validateCase(data)
      if (seen.has(profile.id)) throw new Error(`id дела «${profile.id}» повторяется`)
      seen.add(profile.id)
      return profile
    } catch (error) {
      throw new Error(`${key}\n${error instanceof Error ? error.message : String(error)}`)
    }
  })
}

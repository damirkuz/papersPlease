import assert from 'node:assert/strict'
import test from 'node:test'
import { parseCases, validateCase } from '../src/content/schema'
import sasha from '../src/content/characters/sasha.json'
import demo from '../src/content/characters/demo.json'
import { manifest } from '../src/content/manifest'

test('оба дела валидны и используют разные сюжеты', () => {
  const cases = parseCases({ 'sasha.json': sasha, 'demo.json': demo })
  assert.deepEqual(cases.map(({ status }) => status), ['ready', 'demo'])
})

test('в очереди готовы три дела в порядке показа', () => {
  const cases = parseCases(manifest)
  assert.deepEqual(cases.filter(item => item.status === 'ready').map(item => item.id), ['sasha', 'niyaz', 'mark'])
})

test('отклоняет отсутствующий answerId', () => {
  const candidate = structuredClone(sasha)
  Object.assign(candidate.scenes[0], { answerId: 'missing' })
  assert.throws(() => validateCase(candidate), /answerId/)
})

test('отклоняет неизвестное показание и неутверждённую развязку открытой истории', () => {
  const unknown = structuredClone(sasha)
  Object.assign(unknown.scenes[1], { afterNoteId: 'missing' })
  assert.throws(() => validateCase(unknown), /afterNoteId/)
  const unapproved = structuredClone(sasha)
  unapproved.scenes[1].outcome!.approvedForShow = false
  assert.throws(() => validateCase(unapproved), /outcome/)
})

test('отклоняет две подделки', () => {
  const candidate = structuredClone(sasha)
  Object.assign(candidate.facts[0], { isFabricated: true, sourceType: 'fictional' })
  assert.throws(() => validateCase(candidate), /ровно одна подделка/)
})

test('отклоняет отсутствующие и повторные id сцен', () => {
  const noId = structuredClone(sasha)
  Reflect.deleteProperty(noId.scenes[0], 'id')
  assert.throws(() => validateCase(noId), /scenes\.0\.id/)
  const duplicate = structuredClone(sasha)
  duplicate.scenes[1].id = duplicate.scenes[0].id
  assert.throws(() => validateCase(duplicate), /повторяется/)
})

test('отклоняет неутверждённые сведения и ссылки на неизвестные документы', () => {
  const unapproved = structuredClone(sasha)
  unapproved.facts[0].approvedForShow = false
  assert.throws(() => validateCase(unapproved), /утвердить/)
  const missing = structuredClone(sasha)
  missing.scenes[0].documentIds.push('missing')
  assert.throws(() => validateCase(missing), /documentIds/)
})

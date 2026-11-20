import assert from 'node:assert/strict'
import test from 'node:test'
import { createSession, reduceRound, currentScene } from '../src/game/engine'
import { validateCase } from '../src/content/schema'
import raw from '../src/content/characters/sasha.json'
import demo from '../src/content/characters/demo.json'

const profile = validateCase(raw)
if (profile.status === 'placeholder') throw new Error('Expected a playable case')
const engine = reduceRound.bind(null, profile)

test('вступление, неверное решение, расследование и обязательное одобрение', () => {
  const profile = validateCase(demo)
  if (profile.status === 'placeholder') throw new Error('Expected a playable case')
  const engine = reduceRound.bind(null, profile)
  let state = createSession()
  state = engine(state, { type: 'advance' })
  const facts = currentScene(profile, state)!
  assert.equal(facts.type, 'facts')
  assert.equal(engine(state, { type: 'advance' }), state)
  assert.equal(engine(state, { type: 'reveal' }), state)
  if (facts.type !== 'facts') throw new Error('Expected a fact check')
  const wrong = facts.factIds.find(id => id !== facts.answerId)!
  state = engine(state, { type: 'select', id: wrong })
  assert.equal(state.progress[facts.id]?.revealed, false)
  state = engine(state, { type: 'reveal' })
  assert.equal(state.progress[facts.id]?.revealed, true)
  assert.equal(engine(state, { type: 'select', id: facts.answerId }), state)
  state = engine(state, { type: 'advance' })
  const incident = currentScene(profile, state)!
  if (incident.type !== 'incident') throw new Error('Expected an incident')
  state = engine(state, { type: 'select', id: incident.answerId })
  state = engine(state, { type: 'reveal' })
  state = engine(state, { type: 'advance' })
  const witness = currentScene(profile, state)!
  if (witness.type !== 'witness') throw new Error('Expected witnesses')
  state = engine(state, { type: 'select', id: witness.evidenceIds[0] })
  assert.equal(engine(state, { type: 'reveal' }), state)
  state = engine(state, { type: 'select', id: witness.evidenceIds[1] })
  assert.equal(engine(state, { type: 'select', id: witness.evidenceIds[2] }), state)
  state = engine(state, { type: 'reveal' })
  state = engine(state, { type: 'advance' })
  assert.equal(currentScene(profile, state)?.type, 'verdict')
  state = engine(state, { type: 'advance' })
  assert.equal(state.position, 'ceremony')
  assert.equal(engine(state, { type: 'advance' }), state)
  state = engine(state, { type: 'approve' })
  assert.equal(state.approved, true)
  assert.equal(engine(state, { type: 'back' }).approved, true)
  assert.equal(engine(state, { type: 'restart' }).approved, false)
})

test('возврат сохраняет выбор, перезапуск этапа его очищает', () => {
  let state = engine(createSession(), { type: 'advance' })
  const scene = currentScene(profile, state)!
  if (scene.type !== 'facts') throw new Error('Expected a fact check')
  state = engine(state, { type: 'select', id: scene.answerId })
  state = engine(state, { type: 'reveal' })
  state = engine(state, { type: 'advance' })
  state = engine(state, { type: 'back' })
  assert.equal(state.progress[scene.id]?.chosen[0], scene.answerId)
  state = engine(state, { type: 'resetStage' })
  assert.equal(state.progress[scene.id], undefined)
  assert.equal(currentScene(profile, state)?.id, scene.id)
})

test('порядок и отключение необязательных сцен применяются из JSON', () => {
  const [facts, incident, witness, verdict] = demo.scenes
  const edited = validateCase({ ...demo, scenes: [incident, facts, { ...witness, optional: true, enabled: false }, verdict] })
  if (edited.status === 'placeholder') throw new Error('Expected a playable case')
  let state = reduceRound(edited, createSession(), { type: 'advance' })
  for (const type of ['incident', 'facts']) {
    const scene = currentScene(edited, state)
    assert.equal(scene?.type, type)
    if (scene?.type !== 'incident' && scene?.type !== 'facts') throw new Error('Expected a quiz')
    state = reduceRound(edited, state, { type: 'select', id: scene.answerId })
    state = reduceRound(edited, state, { type: 'reveal' })
    state = reduceRound(edited, state, { type: 'advance' })
  }
  assert.equal(currentScene(edited, state)?.type, 'verdict')
})

test('открытая история раскрывается без выбора и ведёт прямо к награждению', () => {
  let state = engine(createSession(), { type: 'advance' })
  const facts = currentScene(profile, state)
  if (facts?.type !== 'facts') throw new Error('Expected a fact check')
  state = engine(state, { type: 'select', id: facts.answerId })
  state = engine(state, { type: 'reveal' })
  state = engine(state, { type: 'advance' })
  const story = currentScene(profile, state)
  assert.equal(story?.type, 'discussion')
  assert.equal(engine(state, { type: 'advance' }), state)
  assert.equal(engine(state, { type: 'select', id: 'made-it' }), state)
  state = engine(state, { type: 'reveal' })
  assert.deepEqual(state.progress[story!.id], { chosen: [], revealed: true })
  state = engine(state, { type: 'advance' })
  assert.equal(state.position, 'ceremony')
  state = engine(state, { type: 'back' })
  assert.equal(currentScene(profile, state)?.id, story?.id)
})

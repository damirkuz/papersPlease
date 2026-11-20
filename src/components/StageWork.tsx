import type { KeyboardEvent } from 'react'
import type { PlayableCase, Scene } from '../content/schema'
import { ui } from '../content/strings'
import type { StageProgress } from '../game/engine'
import { IncidentExhibit } from './IncidentExhibit'
import { Emblem, Icon } from './ui'

type WorkProps = {
  profile: PlayableCase
  scene: Scene
  progress: StageProgress
  select: (id: string) => void
}

function moveFocus(event: KeyboardEvent<HTMLElement>) {
  const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
  const step = keys[event.key]
  if (!step) return
  const options = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
  if (!options.length) return
  event.preventDefault()
  const index = options.indexOf(document.activeElement as HTMLButtonElement)
  options[(index + options.length + step) % options.length].focus()
}

function Question({ profile, scene, progress, select }: WorkProps & {
  scene: Extract<Scene, { type: 'facts' | 'incident' }>
}) {
  const facts = scene.type === 'facts'
  const options = facts
    ? scene.factIds.map(id => profile.facts.find(item => item.id === id)!)
    : scene.options
  const correct = options.find(item => item.id === scene.answerId)!
  const chosen = options.find(item => item.id === progress.chosen[0])
  return <section className={`work-paper paper question-paper ${facts ? 'fact-paper' : 'incident-paper'}`}>
    <div className="form-kicker">
      <span><Icon name={facts ? 'file' : 'route'} size={17} /> {facts ? ui.dossier : ui.question}</span>
      <span>{profile.caseNumber}</span>
    </div>
    {scene.type === 'incident' && <IncidentExhibit scene={scene} revealed={progress.revealed} />}
    <h3 id="question">{scene.prompt}</h3>
    {progress.revealed ? <div className="result-block" aria-live="polite">
      <div className="result-copy">
        <span className="result-stamp">{facts ? ui.fake : ui.actual}</span>
        <strong>{chosen?.id === correct.id ? scene.correctFeedback : scene.wrongFeedback}</strong>
        <p className="result-answer">{correct.text}</p>
        <p>{scene.explanation}</p>
      </div>
      {chosen?.id !== correct.id && <p className="chosen-summary"><b>{ui.selected}</b> {chosen?.text}</p>}
    </div> : <div className="options" role="group" aria-labelledby="question" onKeyDown={moveFocus}>
      {options.map((item, index) => <button key={item.id} className="choice" type="button"
        onClick={() => select(item.id)} aria-pressed={progress.chosen.includes(item.id)}>
        <span className="choice-letter">{ui.letter(index)}</span><span>{item.text}</span>
        <span className="choice-cursor" aria-hidden="true"><Icon name="chevron" size={14} /></span>
      </button>)}
    </div>}
  </section>
}

const evidenceType = 'application/x-birthday-evidence'

function WitnessBoard({ profile, scene, progress, select }: WorkProps & {
  scene: Extract<Scene, { type: 'witness' }>
}) {
  const evidence = scene.evidenceIds.map(id => profile.evidence.find(item => item.id === id)!)
  const matched = scene.answerIds.every(id => progress.chosen.includes(id))
  return <section className="work-paper paper witness-paper">
    <div className="form-kicker">
      <span><Icon name="journal" size={17} /> {ui.evidence}</span>
      <span>{profile.caseNumber}</span>
    </div>
    <h3 id="evidence-question">{scene.prompt}</h3>
    <div className="evidence-list" role="group" aria-labelledby="evidence-question" onKeyDown={moveFocus}>
      {evidence.map(item => {
        const chosen = progress.chosen.includes(item.id)
        return <button key={item.id} className="evidence-card" type="button"
          onClick={() => select(item.id)} aria-pressed={chosen}
          disabled={progress.revealed || (!chosen && progress.chosen.length === 2)}
          draggable={!progress.revealed && !chosen && progress.chosen.length < 2}
          onDragStart={event => {
            event.dataTransfer.setData(evidenceType, item.id)
            event.dataTransfer.effectAllowed = 'move'
          }}>
          <span className="evidence-pin" aria-hidden="true" />
          <span className="evidence-icon"><Icon name={item.icon} size={25} /></span>
          <strong>{item.title}</strong>
          <span className="evidence-text">{item.text}</span>
        </button>
      })}
    </div>
    {progress.revealed ? <div className="result-block witness-result" aria-live="polite">
      <strong>{ui.statement}</strong><p>{scene.conclusion}</p>
      {!matched && <p>{scene.alternateFeedback}</p>}
    </div> : <div className="evidence-tray" data-testid="evidence-dropzone"
      onDragOver={event => {
        if (!event.dataTransfer.types.includes(evidenceType)) return
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
      }}
      onDrop={event => {
        event.preventDefault()
        const id = event.dataTransfer.getData(evidenceType)
        if (evidence.some(item => item.id === id) && !progress.chosen.includes(id)) select(id)
      }}>
      <div className="tray-label"><span>{ui.slots}</span><span>{progress.chosen.length} / 2</span></div>
      <div className="evidence-slots">
        {[0, 1].map(index => {
          const item = evidence.find(entry => entry.id === progress.chosen[index])
          return item
            ? <button key={index} type="button" aria-label={`${ui.removeEvidence}: ${item.title}`} onClick={() => select(item.id)}>
              <Icon name="check" size={16} />{item.title}<Icon name="close" size={14} />
            </button>
            : <span key={index}><Icon name="plus" size={16} />{ui.slot}</span>
        })}
      </div>
    </div>}
  </section>
}

export function StageWork(props: WorkProps) {
  const { scene, profile } = props
  if (scene.type === 'facts' || scene.type === 'incident') return <Question {...props} scene={scene} />
  if (scene.type === 'discussion') {
    const { revealed } = props.progress
    const note = revealed ? profile.evidence.find(item => item.id === scene.afterNoteId) : undefined
    return <section className="work-paper paper discussion-paper">
      <div className="form-kicker">
        <span><Icon name="file" size={17} />{ui.report}</span><span>{profile.caseNumber}</span>
      </div>
      <IncidentExhibit scene={scene} revealed={revealed} />
      {!revealed && <h3>{scene.prompt}</h3>}
      <div className="story-disclosure" aria-live="polite">
        {revealed && <div className="result-block story-result">
          <h3>{scene.outcome.title}</h3>
          <p>{scene.outcome.text}</p>
        </div>}
        {note && <blockquote className="story-note">
          <footer><Icon name={note.icon} size={16} />{note.title}</footer>
          <p>«{note.text}»</p>
        </blockquote>}
      </div>
    </section>
  }
  if (scene.type === 'witness') return <WitnessBoard {...props} scene={scene} />
  return <section className="work-paper paper verdict-paper">
    <div className="form-kicker"><span>{ui.allegations}</span><span>{profile.caseNumber}</span></div>
    <Emblem className="verdict-emblem" />
    <h3>{ui.charge}</h3>
    <p>{scene.charge}</p>
    <hr />
    <h4>{ui.ruling}</h4>
    <p>{scene.ruling}</p>
  </section>
}

import { useState } from 'react'
import type { Dialogue, Document, PlayableCase, Scene } from '../content/schema'
import { ui } from '../content/strings'
import { canReveal, type StageProgress } from '../game/engine'
import { StageWork } from './StageWork'
import { Asset, assetPath, Emblem, Icon, Modal, Portrait, Primary } from './ui'

function DialogueBox({ lines, name }: { lines: Dialogue; name: string }) {
  const [index, setIndex] = useState(0)
  const line = lines[index]
  return <div className="dialogue" aria-live="polite">
    <div className="dialogue-speaker">{line.speaker === 'citizen' ? name : ui.inspector}
      {lines.length > 1 && <button className="dialogue-next" type="button" aria-label={ui.nextLine} title={ui.nextLine}
        onClick={() => setIndex((index + 1) % lines.length)}>
        {index + 1}/{lines.length} <Icon name="arrow" size={15} />
      </button>}
    </div>
    <p key={index}>«{line.text}»</p>
  </div>
}

function Visitor({ profile, scene, progressed, arriving, adjusting }: {
  profile: PlayableCase; scene: Scene; progressed: boolean; arriving: boolean; adjusting: boolean
}) {
  const reveal = 'revealDialogue' in scene && progressed
  const windowClass = scene.visitorFraming ? 'window-forehead' : adjusting ? 'window-adjusting' : ''
  const cockpit = scene.visitorBackdrop === 'cockpit'
  return <aside className="visitor station">
    <div className="station-bar"><span>{ui.inspectionWindow}</span><i className="signal" /></div>
    <div className={`visitor-window ${arriving ? 'window-opening' : ''} ${windowClass} ${cockpit ? 'window-cockpit' : ''}`}>
      {cockpit && <img src={assetPath('assets/decorations/cockpit.svg')} className="cockpit-backdrop" alt="" />}
      <div className="window-lamp" aria-hidden="true" />
      <Portrait path={profile.portrait} name={profile.displayName} />
      <span className="window-frame" aria-hidden="true" />
      {profile.windowMark && <span className="window-mark" aria-hidden="true">{profile.windowMark}</span>}
    </div>
    <div className="visitor-name"><span className="tag">{ui.citizen}</span><strong>{profile.displayName}</strong></div>
    <DialogueBox key={`${scene.id}-${reveal}`} lines={reveal ? scene.revealDialogue : scene.dialogue}
      name={profile.displayName} />
  </aside>
}

function DocumentWindow({ doc, docs, profile, scene, switchDocument, close }: {
  doc: Document
  docs: Document[]
  profile: PlayableCase
  scene: Scene
  switchDocument: (doc: Document) => void
  close: () => void
}) {
  const passport = doc.kind === 'passport'
  const enclosed = doc.kind === 'dossier' && scene.type === 'facts'
    ? scene.factIds.map(id => profile.facts.find(fact => fact.id === id)!)
    : []
  return <Modal title={doc.title} close={close} className="document-view" tone="paper">
    <div className="document-body">
      {docs.length > 1 && <div className="document-switcher" role="group" aria-label={ui.docs}>
        {docs.map(item => <button type="button" key={item.id} aria-current={item.id === doc.id}
          onClick={() => switchDocument(item)}>{item.title}</button>)}
      </div>}
      <div className="form-kicker"><span>{doc.reference}</span><span>{profile.caseNumber}</span></div>
      <div className={`document-details ${passport ? 'passport-details' : ''}`}>
        {passport && <Portrait name={profile.displayName} path={profile.portrait} />}
        <dl>
          {passport && <>
            <dt>{ui.citizen}</dt><dd>{profile.displayName}</dd>
            <dt>{ui.permit}</dt><dd>{profile.permitReason}</dd>
          </>}
          {doc.details.map((item, index) => <div key={index}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
        </dl>
      </div>
      <Asset path={doc.image} alt={doc.title} className="document-image" fallback={
        doc.image ? <div className="document-empty" role="img" aria-label={doc.title}><Icon name="file" size={36} /></div> : null
      } />
      <p>{doc.text}</p>
      {enclosed.length > 0 && <ol className="enclosed-facts">{enclosed.map(item => <li key={item.id}>{item.text}</li>)}</ol>}
      <div className="document-foot"><Emblem />{ui.ministry}</div>
    </div>
  </Modal>
}

export function StageHeader({ title, subtitle, stages, current, ceremony = false }: {
  title: string; subtitle: string; stages: Scene[]; current: number; ceremony?: boolean
}) {
  return <div className="stage-header">
    <div>
      <div className="stage-kicker">{ceremony ? ui.medalLabel : ui.stage(current + 1, stages.length)}</div>
      <h1 tabIndex={-1}>{title}</h1>
      <p>{subtitle}</p>
    </div>
    <ol className="stage-track" aria-label={ui.report}>
      {stages.map((item, index) => <li key={item.id} title={item.title}
        aria-current={index === current ? 'step' : undefined} className={index < current ? 'past' : ''}>
        {index < current ? <Icon name="check" size={15} /> : ui.letter(index)}
        <span className="sr-only">{item.title}</span>
      </li>)}
      <li aria-current={ceremony ? 'step' : undefined} title={ui.ceremony}>
        <Icon name="stamp" size={18} /><span className="sr-only">{ui.ceremony}</span>
      </li>
    </ol>
  </div>
}

export function Desk({
  profile, scene, progress, arriving, adjusting, lastStage, openedDocuments, onSelect, onReveal, onAdvance, onDocument,
}: {
  profile: PlayableCase
  scene: Scene
  progress: StageProgress
  arriving: boolean
  adjusting: boolean
  lastStage: boolean
  openedDocuments: string[]
  onSelect: (id: string) => void
  onReveal: () => void
  onAdvance: () => void
  onDocument: (id: string) => void
}) {
  const [open, setOpen] = useState<Document>()
  const docs = scene.documentIds.map(id => profile.documents.find(item => item.id === id)!)
  const opened = docs.filter(doc => openedDocuments.includes(doc.id)).length
  const verdict = scene.type === 'verdict'
  const ready = canReveal(scene, progress)
  const resolved = progress.revealed || verdict
  const revealLabel = { facts: ui.check, incident: ui.reveal, discussion: ui.reveal, witness: ui.conclude, verdict: ui.toCeremony }[scene.type]

  function openDocument(doc: Document) {
    setOpen(doc)
    onDocument(doc.id)
  }

  return <div className="workbench">
    <Visitor profile={profile} scene={scene} progressed={progress.revealed} arriving={arriving} adjusting={adjusting} />
    <section className="inspector-desk station">
      <div className="station-bar"><span>{ui.desk}</span><span className="desk-case">{profile.caseNumber}</span></div>
      <div className="desk-surface">
        <div className="document-tabs" aria-label={ui.docs}>
          {docs.map(doc => <button type="button" key={doc.id} className={`document-tab tab-${doc.kind}`}
            aria-haspopup="dialog" title={ui.openDoc} onClick={() => openDocument(doc)}>
            <Icon name={doc.kind === 'passport' ? 'passport' : 'file'} size={17} />{doc.title}<Icon name="expand" size={13} />
          </button>)}
        </div>
        <StageWork profile={profile} scene={scene} progress={progress} select={onSelect} />
      </div>
    </section>
    <aside className="journal station">
      <div className="station-bar"><span>{ui.journal}</span><Icon name="journal" size={17} /></div>
      <div className="journal-body">
        <div className="journal-task">
          <h2>{ui.task}</h2>
          <p>{scene.instruction}</p>
        </div>
        <div className="journal-state" aria-live="polite">
          <i className={`signal ${resolved || ready ? 'signal-active' : 'signal-wait'}`} />
          {verdict ? ui.pending : progress.revealed ? ui.resolved : ui.pause}
        </div>
        <div className="document-log">
          <div className="tag" aria-live="polite">{ui.openedDocuments(opened, docs.length)}</div>
          <ul>
            {docs.map(doc => {
              const read = openedDocuments.includes(doc.id)
              return <li key={doc.id} className={read ? 'logged' : ''}>
                <Icon name={read ? 'check' : 'file'} size={15} />{doc.title}
              </li>
            })}
          </ul>
        </div>
        <div className="journal-action">
          {verdict || progress.revealed
            ? <Primary onClick={onAdvance}>{lastStage ? ui.toCeremony : ui.next}</Primary>
            : <Primary disabled={!ready} onClick={onReveal} icon={scene.type === 'witness' ? 'journal' : 'stamp'}>{revealLabel}</Primary>}
        </div>
      </div>
    </aside>
    {open && <DocumentWindow doc={open} docs={docs} profile={profile} scene={scene}
      switchDocument={openDocument} close={() => setOpen(undefined)} />}
  </div>
}

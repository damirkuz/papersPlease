import type { PlayableCase } from '../content/schema'
import { stamp, ui } from '../content/strings'
import { Asset, assetPath, Emblem, Icon, Primary } from './ui'

export function Lobby({ view, cases, completed, profile, onStart, onChoose, onCall }: {
  view: 'home' | 'select' | 'intro' | 'finished'
  cases: PlayableCase[]
  completed: string[]
  profile?: PlayableCase
  onStart: () => void
  onChoose: (profile: PlayableCase) => void
  onCall: () => void
}) {
  const intro = view === 'intro' ? profile?.intro : undefined
  const title = intro?.title ?? {
    home: ui.homeTitle, select: ui.select, intro: ui.circular, finished: ui.finishTitle,
  }[view]
  const body = intro?.notice ?? {
    home: ui.homeBody, select: ui.selectBody, intro: '', finished: ui.finishBody,
  }[view]
  return <section className={`lobby lobby-${view}`}>
    <figure className="checkpoint">
      <img className="checkpoint-image" src={assetPath('assets/decorations/checkpoint.svg')} alt="" />
      <img className="checkpoint-image checkpoint-queue" src={assetPath('assets/decorations/checkpoint-queue.svg')} alt="" />
      <div className="checkpoint-scan" />
      <div className="surveillance">
        <span><i className="signal" /> {ui.duty}</span>
        <span>01</span>
      </div>
      <div className="checkpoint-corners" aria-hidden="true" />
      <figcaption><span>{ui.checkpoint}</span><span>{ui.shift}</span></figcaption>
    </figure>
    <div className="dispatch-wrap">
      <div className="dispatch paper">
        <div className="paper-mast">
          <Emblem />
          <span>{intro ? ui.circular : ui.ministry}</span>
        </div>
        <h1 tabIndex={-1}>{title}</h1>
        <p className="dispatch-copy">{body}</p>
        {intro && profile && <div className="dispatch-subject">
          <span className="tag">{ui.case} {profile.caseNumber}</span>
          <p>{intro.subject}</p>
        </div>}
        {(view === 'select' || view === 'finished') && <div className="citizen-list">
          {cases.length === 0 && <p>{ui.noCases}</p>}
          {cases.map(item => {
            const done = completed.includes(item.id)
            return <button key={item.id} className="citizen-row" data-completed={done} onClick={() => onChoose(item)}>
              <span className="citizen-row-icon" aria-hidden="true">
                <Asset path={item.portrait} alt="" className="citizen-avatar" fallback={<Icon name="passport" />} />
              </span>
              <span><strong>{item.displayName}</strong><small>{item.caseNumber}{done && ` · ${ui.sealed}`}</small></span>
              <Icon name={done ? 'check' : 'arrow'} />
            </button>
          })}
        </div>}
        {view === 'home' && <Primary onClick={onStart}>{ui.start}</Primary>}
        {intro && <Primary onClick={onCall}>{ui.call}</Primary>}
        {view === 'finished' && <div className="registry-stamp" aria-hidden="true">{stamp.label}</div>}
      </div>
    </div>
  </section>
}

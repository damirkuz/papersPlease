import { useEffect, useState } from 'react'
import type { Case, PlayableCase } from './content/schema'
import { ui } from './content/strings'
import { Award } from './components/Award'
import { Desk, StageHeader } from './components/Desk'
import { Lobby } from './components/Lobby'
import { Emblem, Icon, Modal } from './components/ui'
import { createSession, currentScene, enabledScenes, initialProgress, reduceRound, type Action } from './game/engine'
import { playSound, setSoundMuted } from './game/sound'

type View = 'home' | 'select' | 'round' | 'finished'
type Panel = 'settings' | 'restart' | 'reset' | 'exit'

export function App({ cases }: { cases: Case[] }) {
  const ready = cases.filter(item => item.status === 'ready') as PlayableCase[]
  const preparation = cases.filter(item => item.status === 'placeholder')
  const demo = cases.find((item): item is PlayableCase => item.status === 'demo')
  const [view, setView] = useState<View>('home')
  const [profile, setProfile] = useState<PlayableCase>()
  const [completed, setCompleted] = useState<string[]>([])
  const [session, setSession] = useState(createSession)
  const [roundKey, setRoundKey] = useState(0)
  const [panel, setPanel] = useState<Panel>()
  const [sound, setSound] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [full, setFull] = useState(false)
  const [notice, setNotice] = useState('')
  const active = view === 'round' ? profile : undefined
  const scene = active && currentScene(active, session)
  const stages = active ? enabledScenes(active) : []
  const stageIndex = typeof session.position === 'number' ? session.position : -1
  const ceremony = Boolean(active && session.position === 'ceremony')
  const next = active?.status === 'ready' && ready.find(item => item.id !== active.id && !completed.includes(item.id))
  const speak = (sample: Parameters<typeof playSound>[0]) => { if (sound) playSound(sample) }

  function changeSound(enabled: boolean) {
    setSound(enabled)
    setSoundMuted(!enabled)
    if (enabled) playSound('select')
  }

  function dispatch(action: Action) {
    if (active) setSession(state => reduceRound(active, state, action))
  }

  function start(item: PlayableCase) {
    setProfile(item)
    setSession(createSession())
    setRoundKey(key => key + 1)
    setPanel(undefined)
    setView('round')
    speak('paper')
  }

  function move(action: 'advance' | 'back' | 'reveal') {
    if (action === 'reveal') speak(scene && 'shore' in scene && scene.shore ? 'water' : 'reveal')
    else speak(action === 'advance' && session.position === 'intro' ? 'call' : 'paper')
    dispatch({ type: action })
  }

  function approve() {
    if (!active || !ceremony || session.approved) return
    dispatch({ type: 'approve' })
    if (active.status === 'ready') setCompleted(list => list.includes(active.id) ? list : [...list, active.id])
    speak('stamp')
    speak('award')
  }

  function closeCase() {
    if (!session.approved) return
    setView(active?.status === 'ready' && ready.every(item => completed.includes(item.id)) ? 'finished' : 'select')
  }

  function reset() {
    setPanel(undefined)
    setCompleted([])
    setProfile(undefined)
    setSession(createSession())
    setView('home')
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
      setNotice('')
    } catch {
      setNotice(ui.fullscreenFailed)
    }
  }

  useEffect(() => {
    const listener = () => setFull(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', listener)
    return () => document.removeEventListener('fullscreenchange', listener)
  }, [])

  useEffect(() => {
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
  }, [view, active?.id, session.position, roundKey])

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey ||
        document.querySelector('dialog[open]') || event.defaultPrevented) return
      const key = event.key.toLowerCase()
      if (event.code === 'KeyM') changeSound(!sound)
      if (event.code === 'KeyF') void toggleFullscreen()
      if (event.code === 'KeyR' && active) setPanel('restart')
      if ((key === 'enter' || key === ' ') && (event.target === document.body || event.target instanceof HTMLHeadingElement)) {
        const primary = document.querySelector<HTMLButtonElement>('[data-primary]:not(:disabled)')
        if (primary) {
          event.preventDefault()
          primary.click()
        }
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  })

  const prompts = {
    restart: { title: ui.resetTitle, text: ui.resetBody, button: ui.resetRound, action: () => {
      dispatch({ type: 'restart' })
      setRoundKey(key => key + 1)
      setPanel(undefined)
    } },
    reset: { title: ui.resetSessionTitle, text: ui.resetSessionBody, button: ui.resetSession, action: reset },
    exit: { title: ui.exitTitle, text: ui.exitBody, button: ui.exit, action: () => { setView('select'); setPanel(undefined) } },
  }

  return <div className={`game-shell ${reduceMotion ? 'reduced-motion' : ''}`}>
    <header className="toolbar">
      <div className="brand">
        <div className="brand-mark"><Emblem /></div>
        <div><strong>{ui.ministry}</strong><small>{ui.control}</small></div>
      </div>
      <div className="toolbar-center">{active
        ? <><span className="case-code">{active.caseNumber}</span><strong>{active.displayName}</strong>
          {active.status === 'demo' && <span className="demo-badge">{ui.demoBadge}</span>}</>
        : <><i className="signal" /><span>{ui.checkpoint}</span></>}</div>
      <div className="toolbar-actions">
        <button className="icon-button" type="button" aria-label={sound ? ui.soundOn : ui.soundOff}
          aria-keyshortcuts="M" aria-pressed={sound} title={`${ui.sound} · M`} onClick={() => changeSound(!sound)}>
          <Icon name={sound ? 'sound' : 'mute'} />
        </button>
        <button className="icon-button" type="button" aria-label={full ? ui.exitFullscreen : ui.fullscreen}
          aria-keyshortcuts="F" title={`${ui.fullscreen} · F`} onClick={() => void toggleFullscreen()}>
          <Icon name={full ? 'exitFullscreen' : 'fullscreen'} />
        </button>
        <button className="icon-button settings-toggle" type="button" aria-label={ui.settings} title={ui.settings}
          aria-haspopup="dialog" onClick={() => setPanel('settings')}><Icon name="settings" /></button>
      </div>
    </header>

    <main id="game" className={scene || ceremony ? 'game-main active-game' : 'game-main'}>
      {active && scene ? <>
        <StageHeader title={scene.title} subtitle={scene.subtitle} stages={stages} current={stageIndex} />
        <Desk key={`${roundKey}-${scene.id}`} profile={active} scene={scene}
          progress={session.progress[scene.id] ?? initialProgress}
          arriving={stageIndex === 0}
          adjusting={stages[stageIndex - 1]?.visitorFraming === 'forehead'}
          lastStage={stageIndex === stages.length - 1}
          openedDocuments={session.openedDocuments}
          onSelect={id => { dispatch({ type: 'select', id }); speak(scene.type === 'witness' ? 'paper' : 'select') }}
          onReveal={() => move('reveal')} onAdvance={() => move('advance')}
          onDocument={id => { dispatch({ type: 'openDocument', id }); speak('paper') }} />
      </> : active && ceremony ? <>
        <StageHeader title={ui.ceremony} subtitle={ui.ceremonySubtitle} stages={stages} current={stages.length} ceremony />
        <Award profile={active} approved={session.approved} approve={approve} close={closeCase}
          next={next ? { name: next.displayName, open: () => start(next) } : undefined} />
      </> : <Lobby view={view === 'round' ? 'intro' : view} cases={ready} completed={completed} profile={active}
        onStart={() => setView('select')} onChoose={start} onCall={() => move('advance')} />}
    </main>

    <footer className="footer">
      <div className="footer-leading">
        {active
          ? <button type="button" className="footer-button" onClick={() => session.position === 'intro' ? setView('select') : move('back')}>
            <Icon name="back" size={18} />{session.position === 'intro' ? ui.all : ui.back}
          </button>
          : view !== 'home' ? <button type="button" className="footer-button" onClick={() => setView('home')}>
            <Icon name="back" size={18} />{ui.home}
          </button> : <span>{ui.shift}</span>}
      </div>
      {notice && <span className="toolbar-notice" role="status">{notice}</span>}
      <div className="footer-status"><i className="signal" />{ui.score(completed.length, ready.length)}</div>
    </footer>

    {panel === 'settings' && <Modal title={ui.settings} close={() => setPanel(undefined)} className="settings">
      <div className="settings-body">
        <label><input type="checkbox" checked={sound} onChange={event => changeSound(event.target.checked)} />{ui.sound}<kbd>M</kbd></label>
        <label><input type="checkbox" checked={reduceMotion} onChange={event => setReduceMotion(event.target.checked)} />{ui.motion}</label>
        <div className="settings-actions">
          {scene && <button type="button" onClick={() => {
            dispatch({ type: 'resetStage' })
            setRoundKey(value => value + 1)
            setPanel(undefined)
          }}>{ui.resetStage}</button>}
          {active && <button type="button" onClick={() => setPanel('restart')}>{ui.resetRound}<kbd>R</kbd></button>}
          <button type="button" onClick={() => {
            if (active) setPanel('exit')
            else { setView('select'); setPanel(undefined) }
          }}>{ui.all}</button>
          {demo && <button type="button" onClick={() => start(demo)}>{ui.demo}</button>}
          <button type="button" onClick={() => setPanel('reset')}>{ui.resetSession}</button>
        </div>
        {preparation.length > 0 && <section className="preparation">
          <h3>{ui.prepared}</h3>
          <ul>{preparation.map(item => <li key={item.id}><b>{item.displayName}</b><span>{item.preparationNote}</span></li>)}</ul>
        </section>}
      </div>
    </Modal>}
    {panel && panel !== 'settings' && <Modal key={panel} title={prompts[panel].title} close={() => setPanel(undefined)} className="confirm">
      <div className="confirm-body"><p>{prompts[panel].text}</p>
        <div className="confirm-actions">
          <button type="button" className="secondary" onClick={() => setPanel(undefined)}>{ui.cancel}</button>
          <button type="button" className="primary" onClick={prompts[panel].action}>{prompts[panel].button}</button>
        </div>
      </div>
    </Modal>}
  </div>
}

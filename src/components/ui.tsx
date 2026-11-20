import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ui } from '../content/strings'

const paths: Record<string, string> = {
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  back: 'M20 12H5m6-6-6 6 6 6',
  sound: 'M3 9h4l5-4v14l-5-4H3z M15 9a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12',
  mute: 'M3 9h4l5-4v14l-5-4H3z M16 10l5 5m0-5-5 5',
  fullscreen: 'M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4',
  exitFullscreen: 'M4 8h4V4m12 4h-4V4M4 16h4v4m12-4h-4v4',
  settings: 'M3 6h18M3 12h18M3 18h18M8 3v6m8 0v6m-6 0v6',
  close: 'm6 6 12 12M18 6 6 18',
  file: 'M5 3h9l5 5v13H5z M14 3v6h5M8 12h8m-8 4h8',
  passport: 'M5 3h14v18H5z M8 3v18m3-12h5m-2.5-2.5v5M11 16h5',
  journal: 'M5 3h14v18H5z M8 7h8m-8 4h8m-8 4h6M3 8h4m-4 8h4',
  compass: 'M8 3h8l5 5v8l-5 5H8l-5-5V8z M15 9l-2 5-4 1 2-5z',
  route: 'M6 15v-5h12V6m-4 0h8M2 15h8m-6 4h4m8-17h4',
  plane: 'M3 11h7V4h3l2 7h5l2 2-2 2h-5l-2 5h-3v-5H6l-3-4z',
  ground: 'M3 16v-5h2l2-5h10l2 5h2v5H3zm2-5h14M6 16v3m12-3v3M7 13h1m8 0h1',
  camera: 'M3 6h12v10H3z M16 9l5-3v10l-5-3m-7 4v3m0-1-3 2m3-2 3 2',
  bun: 'M3 13v-3h3V7h12v3h3v7H3z M8 10l2 3m3-3 2 3',
  plus: 'M12 5v14M5 12h14',
  check: 'm4 12 5 5 11-11',
  stamp: 'M5 16h14v4H5z M9 16v-4h2V9H8V6h8v3h-3v3h2v4',
  lock: 'M6 10h12v10H6z M8 10V7l2-3h4l2 3v3m-4 3v4',
  chevron: 'm9 6 6 6-6 6',
  expand: 'M14 4h6v6m0-6-7 7m-3 9H4v-6m0 6 7-7',
}

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter">
    <path d={paths[name] ?? paths.file} />
  </svg>
}

export function Emblem({ className }: { className?: string }) {
  return <svg className={className} aria-hidden="true" viewBox="0 0 32 32" fill="currentColor" shapeRendering="crispEdges">
    <path d="M2 2h28v2H2zm0 26h28v2H2zM2 4h2v24H2zm26 0h2v24h-2zM6 24h20v2H6zM8 18h16v5H8zm2-3h12v2H10zm1-4h2v4h-2zm4-2h2v6h-2zm4 2h2v4h-2zm-4-5h2v2h-2z" />
  </svg>
}

export const assetPath = (path: string) => import.meta.env.BASE_URL + path

export function Asset({ path, alt, className, fallback }: {
  path?: string; alt: string; className?: string; fallback?: ReactNode
}) {
  const [failed, setFailed] = useState<string>()
  const [loaded, setLoaded] = useState<string>()
  if (!path || failed === path) return fallback ?? null
  return <>
    {loaded !== path && fallback}
    <img className={className} src={assetPath(path)} alt={alt} hidden={loaded !== path}
      onLoad={() => setLoaded(path)} onError={() => setFailed(path)} draggable={false} />
  </>
}

export function Portrait({ name, path, className = '' }: { name: string; path?: string; className?: string }) {
  return <div className={`portrait ${className}`}>
    <Asset path={path} className="portrait-photo" alt={ui.photo(name)} fallback={
      <img className="portrait-silhouette" src={assetPath('assets/decorations/silhouette.svg')}
        alt={ui.portrait} draggable={false} />
    } />
    <span className="view-corner tl" /><span className="view-corner tr" />
    <span className="view-corner bl" /><span className="view-corner br" />
  </div>
}

export function Modal({ title, close, children, className = '', tone = '' }: {
  title: string; close: () => void; children: ReactNode; className?: string; tone?: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const node = dialog.current!
    const lastFocus = document.activeElement
    node.showModal()
    return () => {
      if (node.open) node.close()
      if (lastFocus instanceof HTMLElement && lastFocus.isConnected) lastFocus.focus()
    }
  }, [])
  return <dialog ref={dialog} aria-label={title} className={`modal ${className} ${tone}`}
    onCancel={event => { event.preventDefault(); close() }}
    onClick={event => { if (event.target === event.currentTarget) close() }}>
    <div className="modal-inner">
      <header className="modal-header">
        <h2>{title}</h2>
        <button className="icon-button" type="button" onClick={close} aria-label={ui.close} title={ui.close}>
          <Icon name="close" />
        </button>
      </header>
      {children}
    </div>
  </dialog>
}

export function Primary({ children, onClick, disabled, icon = 'arrow' }: {
  children: ReactNode; onClick: () => void; disabled?: boolean; icon?: string
}) {
  return <button className="primary" type="button" data-primary onClick={onClick} disabled={disabled}>
    {children}<Icon name={icon} />
  </button>
}

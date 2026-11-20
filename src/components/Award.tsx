import type { PlayableCase } from '../content/schema'
import { stamp, ui } from '../content/strings'
import { Asset, Emblem, Icon, Primary } from './ui'

function Medal({ motif }: { motif: PlayableCase['award']['motif'] }) {
  return <svg className="medal" aria-hidden="true" viewBox="0 0 160 182" shapeRendering="crispEdges">
    <path fill="#151b17" d="M39 8h82v6h6v47h-7v9h-12v12h-10v9h14v7h9v9h7v13h6v36h-6v12h-10v8h-14v6H56v-6H42v-8H32v-12h-6v-36h6v-13h7v-9h9v-7h14v-9H52V70H40v-9h-7V14h6z"/>
    <path fill="#6a3932" d="M43 12h74v6h5v40h-9v12h-12v11H59V70H47V59h-9V18h5z"/>
    <path fill="#99513e" d="M43 15h73v5H43zm0 9h12v34h-5v-5h-7zm56 0h15v30h-7v10h-8z"/>
    <path fill="#c59a58" d="M59 16h8v48h-5V53h-3zm35 0h8v37h-3v11h-5z"/>
    <path fill="#b37348" d="M69 21h22v53H69z"/><path fill="#854335" d="M72 22h16v54H72z"/>
    <path fill="#cf9b5d" d="M60 78h40v13H60z"/><path fill="#f2ce7f" d="M65 78h30v4H65z"/>
    <path fill="#9c673e" d="M64 87h32v8H64z"/>
    <path fill="#9c6b42" d="M55 92h50v5h13v10h7v12h5v34h-5v13h-10v8h-14v4H59v-4H45v-8H35v-13h-5v-34h5v-12h7V97h13z"/>
    <path fill="#e8ba70" d="M56 92h48v5h11v10h7v12h6v27h-6v13h-10v8h-14v5H62v-5H48v-8H38v-13h-6v-27h6v-12h7V97h11z"/>
    <path fill="#f6d788" d="M56 92h48v4H56zm-11 7h10v5H45zm-6 9h5v12h-5zm-6 14h5v23h-5z"/>
    <path fill="#bc874e" d="M104 97h10v5h-10zm11 12h7v11h-7zm6 12h6v25h-6zm-7 28h7v10h-7zm-14 14h12v5h-12z"/>
    <path fill="#764c34" d="M61 104h38v5h13v10h6v23h-6v12h-11v7H59v-7H48v-12h-6v-23h6v-10h13z"/>
    <path fill="#ad7e46" d="M63 109h34v5h11v9h5v17h-5v12H97v5H63v-5H52v-12h-5v-17h5v-9h11z"/>
    <path fill="#523d2f" d="M66 114h28v5h9v9h5v10h-5v10h-9v5H66v-5h-9v-10h-5v-10h5v-9h9z"/>
    {motif === 'compass' && <>
      <path fill="#d19a58" d="M78 110h4v12h-4zm0 35h4v10h-4zm-24-14h15v4H54zm36 0h15v4H90z"/>
      <path fill="#f6d98b" d="M87 119h8v8h-4v9h-8v4H72v-8h4v-7h11z"/>
      <path fill="#cc8051" d="M87 125h5v5h-4v6h-8v5H67v-5h6v-5h9v-3h5z"/>
      <path fill="#ffe8a0" d="M79 130h5v5h-5z"/>
    </>}
    {motif === 'star' && <path fill="#f6d98b" d="M76 113h8v11h15v7H89v8h5v8H84v-6h-8v6H66v-8h5v-8H61v-7h15z"/>}
    {motif === 'laurel' && <path fill="#f6d98b" d="M75 145h10v-5h8v-7h5v-11h-7v9h-6v7H75v-7h-6v-9h-7v11h5v7h8zm1-29h8v13h-8z"/>}
    {motif === 'fishing' && <>
      <path fill="#f6d98b" d="M62 136h5v-6h5v-5h6v-4h7v-4h10v3H86v4h-7v4h-6v5h-5v6h-6z" />
      <path fill="#d9b376" d="M93 120h3v13h-3zm-2 13h5v3h-6v-5h1z" />
      <path fill="#96ac86" d="M67 143h7v4h10v-4h7v-5h9v4h-5v4h-7v5H72v-3h-5zm28-5h5v-3h4v6h-4v-3z" />
    </>}
    {motif === 'truck' && <>
      <path fill="#e7bd76" d="M60 122h5v-6h16v4h6v9h15v6h-3v6H59v-13h1z" />
      <path fill="#73533d" d="M65 121h13v8H65zm15 1h4v7h-4zm-18 9h8v2h-8z" />
      <path fill="#fff1b7" d="M62 134h4v2h-4zm25-3h11v2H87z" />
      <path fill="#382f26" d="M67 135h8v3h2v6h-2v3h-8v-3h-2v-6h2zm21 0h8v3h2v6h-2v3h-8v-3h-2v-6h2z" />
      <path fill="#caa067" d="M69 139h4v4h-4zm21 0h4v4h-4z" />
    </>}
    <path fill="#fff1b7" d="M51 103h5v5h-5zm58 53h4v4h-4z"/>
  </svg>
}

function SealPress() {
  return <svg className="seal-press" aria-hidden="true" viewBox="0 0 88 70" shapeRendering="crispEdges">
    <path fill="#443729" d="M27 5h34v4h7v17h-8v7H52v15h24v5h7v13H5V53h8v-5h23V33h-8v-7h-8V9h7z" />
    <path fill="#9a6842" d="M27 9h34v5h4v10h-8v6H31v-6h-8V14h4zm13 20h8v18h-8z" />
    <path fill="#cb9159" d="M28 10h31v4H28zm5 6h21v4H33zm9 15h4v15h-4z" />
    <path fill="#b48854" d="M17 51h55v4h7v6H9v-6h8z" />
    <path fill="#e3ba77" d="M18 51h53v3H18z" />
    <path fill="#4b5d40" d="M8 61h72v3H8z" />
  </svg>
}

export function Award({ profile, approved, approve, close, next }: {
  profile: PlayableCase; approved: boolean; approve: () => void; close: () => void
  next?: { name: string; open: () => void }
}) {
  const award = profile.award
  return <section className="award-layout">
    <div className="medal-stage station">
      <div className="station-bar"><span>{ui.medalLabel}</span><Emblem /></div>
      <div className="medal-display">
        <i className="medal-glint glint-a" /><i className="medal-glint glint-b" /><i className="medal-glint glint-c" />
        <Asset path={award.image} alt={award.title} className="medal-custom" fallback={<Medal motif={award.motif} />} />
      </div>
      <div className="medal-caption"><span>{profile.caseNumber}</span><strong>{profile.displayName}</strong></div>
    </div>
    <div className="award-desk station">
      <div className="award-paper paper">
        <div className="form-kicker"><span><Emblem />{ui.awardOrder}</span><span>{profile.caseNumber}</span></div>
        <h2>{award.title}</h2>
        <p className="citation">{award.citation}</p>
        <div className={`permit ${approved ? 'permit-approved' : ''}`}>
          <div>
            <span className="tag">{ui.permit}</span>
            <strong>{profile.displayName}</strong>
            <span>{profile.permitReason}</span>
          </div>
          <div className="stamp-area">
            {approved ? <>
              <div role="status" className="verdict-stamp">
                <strong>{stamp.label}</strong><span>{stamp.code}</span>
              </div>
              <SealPress />
            </> : <div className="stamp-blank"><Icon name="stamp" size={23} />{ui.stampHere}</div>}
          </div>
        </div>
        {approved && <p className="greeting" aria-live="polite">{award.greeting}</p>}
      </div>
      <div className="award-actions">
        <span><i className="signal" /> {approved ? ui.sealed : ui.pending}</span>
        {approved && next ? <div className="award-button-group">
          <button className="secondary" type="button" onClick={close}>{ui.closeCase}</button>
          <Primary onClick={next.open}>{ui.nextCase(next.name)}</Primary>
        </div> : approved ? <Primary onClick={close}>{ui.closeCase}</Primary> : <Primary onClick={approve} icon="stamp">{ui.stamp}</Primary>}
      </div>
    </div>
  </section>
}

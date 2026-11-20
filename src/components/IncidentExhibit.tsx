import type { Scene } from '../content/schema'
import { ui } from '../content/strings'
import { ParadeExhibit } from './ParadeExhibit'
import { Asset, Icon } from './ui'

type Incident = Extract<Scene, { type: 'incident' | 'discussion' }>
type Route = NonNullable<Incident['route']>

function RouteStrip({ route, revealed }: { route: Route; revealed: boolean }) {
  return <figure className={`route-strip ${revealed ? 'route-resolved' : ''}`}>
    <figcaption><Icon name="route" size={16} />{ui.route}</figcaption>
    <Asset path={route.image} className="route-image" alt={ui.route} />
    <div className="route-stops">
      <span><i /><strong>{route.from}</strong><small>{ui.routeStart}</small></span>
      <span><i /><strong>{route.to}</strong><small>{ui.routeExpected}</small></span>
      <span><i /><strong>{revealed ? route.after : '···'}</strong><small>{revealed ? ui.routeEnd : ui.routeLocked}</small></span>
    </div>
  </figure>
}

function FlightExhibit({ route, revealed }: { route: Route; revealed: boolean }) {
  if (!revealed) return <div className="flight-papers">
    <figure className="flight-paper boarding-pass">
      <figcaption><Icon name="plane" size={18} />{ui.boardingPass}</figcaption>
      <strong>{route.to}</strong>
      <div className="ticket-destination"><Icon name="arrow" size={15} />{route.after}</div>
    </figure>
    <figure className="flight-paper arrival-record">
      <figcaption><Icon name="file" size={17} />{ui.arrivalRecord}</figcaption>
      <strong>{route.from}</strong>
    </figure>
  </div>

  return <figure className="flight-route" aria-label={ui.route}>
    <figcaption><Icon name="route" size={17} />{ui.route}</figcaption>
    <Asset path={route.image} className="route-image" alt={ui.route} />
    <div className="flight-segments">
      <strong>{route.from}</strong>
      <span className="flight-segment"><Icon name="ground" size={17} /><small>{ui.groundLeg}</small></span>
      <strong>{route.to}</strong>
      <span className="flight-segment"><Icon name="plane" size={17} /><small>{ui.flightLeg}</small></span>
      <strong>{route.after}</strong>
    </div>
  </figure>
}

function ShoreMap({ shore, revealed }: { shore: NonNullable<Incident['shore']>; revealed: boolean }) {
  return <figure className={`shore-map ${revealed ? 'shore-resolved' : ''}`} aria-label={shore.title}>
    <figcaption><span><Icon name="route" size={16} />{shore.title}</span><strong>{shore.distance}</strong></figcaption>
    <div className="shore-water">
      <svg aria-hidden="true" viewBox="0 0 360 62" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges">
        <path fill="#586f60" d="M0 0h360v62H0z" />
        <path fill="#698576" d="M92 0h268v8H119v14h19v12h222v13H165v15H77z" />
        <path fill="#7a905c" d="M0 0h108v9h-9v12h15v12h-9v12h-12v17H0z" />
        <path fill="#b1ac79" d="M104 0h7v9h-9v12h15v12h-9v12H96v17h-8V43h12V32h10V23H95V8h9z" />
        <path fill="#a3a16c" d="M10 20h25v3H10zm27 26h25v4H37zm30-38h11v4H67zm2 37h15v3H69z" />
        <path fill="#9bae8b" d="M147 14h42v2h-42zm61 0h17v2h-17zm49 9h62v2h-62zm30 24h64v2h-64zm-134 5h32v2h-32zm82-6h14v2h-14z" opacity=".63" />
        {revealed && <>
          <path className="shore-trail" d="M108 40h41v-5h43v-4h49" fill="none" stroke="#e5d5a0" strokeWidth="2" strokeDasharray="5 4" />
          <path className="shore-fish" fill="#bfd0a0" d="M288 19h13v3h5v3h7v-5h4v13h-4v-5h-7v3h-5v3h-13v-3h-6v-9h6z" />
          <path className="shore-fish" fill="#344f43" d="M288 24h3v3h-3z" />
        </>}
        <g className="shore-rod">
          <path d="M95 38h5v-3h7v-4h6v-3h9v-2h9" fill="none" stroke="#624836" strokeWidth="3" />
          <path d="M96 40h12v4H96z" fill="#463b2a" />
          <path d="M129 27h2v10h-2z" fill="#f0d9a3" />
        </g>
      </svg>
      <span className="shore-bank-label">{shore.bank}</span>
      <span className="shore-water-label">{shore.water}</span>
    </div>
  </figure>
}

export function IncidentExhibit({ scene, revealed }: { scene: Incident; revealed: boolean }) {
  if (scene.shore) return <ShoreMap shore={scene.shore} revealed={revealed} />
  if (scene.parade) return <ParadeExhibit parade={scene.parade} revealed={revealed} />
  if (scene.route) return scene.type === 'discussion'
    ? <FlightExhibit route={scene.route} revealed={revealed} />
    : <RouteStrip route={scene.route} revealed={revealed} />
  return null
}

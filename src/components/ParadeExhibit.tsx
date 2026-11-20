import type { Scene } from '../content/schema'
import { Icon } from './ui'

type Parade = NonNullable<Extract<Scene, { type: 'discussion' }>['parade']>

const buildings = [
  { x: 0, width: 60, top: 39, wall: '#9e735e' },
  { x: 60, width: 53, top: 30, wall: '#809685' },
  { x: 113, width: 65, top: 44, wall: '#b48b6a' },
  { x: 178, width: 55, top: 38, wall: '#936a56' },
  { x: 233, width: 52, top: 28, wall: '#899985' },
  { x: 285, width: 58, top: 37, wall: '#a07560' },
  { x: 343, width: 64, top: 44, wall: '#b69172' },
  { x: 407, width: 52, top: 31, wall: '#859782' },
  { x: 459, width: 62, top: 40, wall: '#9b7160' },
]

const crowd = ['#525b46', '#6d4c43', '#828267', '#505e60', '#83735c']

function Street() {
  return <>
    <path fill="#9eab93" d="M0 0h520v88H0z" />
    <path fill="#b6b9a0" d="M0 9h83v7H0zm127 3h58v6h-58zm239 4h91v5h-91zm97-9h57v6h-57z" />
    {buildings.map(({ x, width, top, wall }) => (
      <g key={x} transform={`translate(${x} ${top})`}>
        <path fill="#4b524b" d={`M0 5h8v-4h8v-4h8v-4h${width - 48}v4h8v4h8v4h8v8H0z`} />
        <rect y="13" width={width} height="41" fill={wall} />
        <path fill="#554e43" d={`M0 13h${width}v3H0zM0 45h${width}v2H0z`} opacity=".65" />
        {[10, 27, 44].map(left => (
          <g key={left}>
            <rect x={left} y="20" width="8" height="11" fill="#566862" />
            <rect x={left} y="34" width="8" height="9" fill="#dec198" />
            <rect x={left + 3} y="32" width="2" height="11" fill="#716b56" />
          </g>
        ))}
      </g>
    ))}
    <path d="M0 44 Q84 71 168 49 T342 49 T520 47" fill="none" stroke="#3c4840" />
    <path fill="#d5b572" d="M20 51h8v9h-3v-3h-3zm76 7h8v9h-3v-3h-3zm113-17h8v9h-3v-3h-3zm78-1h8v9h-3v-3h-3zm85 15h8v9h-3v-3h-3zm93-10h8v9h-3v-3h-3z" />
    <path fill="#ad684f" d="M45 56h8v9h-3v-3h-3zm105-5h8v9h-3v-3h-3zm91-12h8v9h-3v-3h-3zm84 7h8v9h-3v-3h-3zm78 10h8v9h-3v-3h-3z" />
    <path fill="#8d8b71" d="M0 88h520v14H0z" />
    {Array.from({ length: 36 }, (_, index) => (
      <g key={index} transform={`translate(${index * 15 - 3} ${76 + (index % 4) * 2})`}>
        <path fill="#343c32" d="M3 1h9v7H3z" />
        <rect x="4" y="4" width="7" height="5" fill={index % 3 === 0 ? '#c89c76' : '#a48269'} />
        <path fill={crowd[index % crowd.length]} d="M4 9h7v2h3v11H0V12h4z" />
      </g>
    ))}
    <path fill="#303a34" d="M0 92h520v3H0zm0 8h520v2H0z" />
    <path fill="#b3aa90" d="M0 102h520v5H0z" />
    <path fill="#5e6457" d="M0 107h520v41H0z" />
    <path fill="#85816c" d="M0 111h520v2H0zm12 30h49v2H12zm117 0h49v2h-49zm117 0h49v2h-49zm120 0h49v2h-49zm116 0h38v2h-38z" />
  </>
}

function CameraAndChild() {
  return <>
    <path fill="#484b3e" d="M30 130h65v5H30zm100 0h51v5h-51z" />
    <path fill="#2a332e" d="M38 85h12v-4h18v5h10v5h7v9h-9v-3H42zm12 13h10v6H50z" />
    <path fill="#718176" d="M43 86h22v4H43zm-1 6h16v4H42zm34-2h6v8h-6z" />
    <path stroke="#303831" strokeWidth="3" d="M55 103v29m0-29-18 28m18-28 17 28" />
    <path fill="#3d3f34" d="M138 81h10v-4h13v4h5v10h-5v8h-17v-4h-6z" />
    <path fill="#d3a17c" d="M145 86h18v10h-6v5h-9v-5h-3z" />
    <path fill="#7e8e68" d="M143 99h16v3h7v3h7v6h-15v7h-20v-13h5z" />
    <path fill="#a96752" d="M141 104h5v13h-7v-7h2z" />
    <path fill="#d3a17c" d="M170 105h7v6h-7z" />
    <path fill="#343e37" d="M140 117h19v5h-2v10h-12v-4h5v-7h-5v5h-13v-4h8z" />
    <path fill="#e1c088" d="M177 107h22v1h22v1h21v1h22v1h20v1h24v1h16v3h-17v-1h-24v-1h-20v-1h-22v-1h-21v-1h-22v-1h-21z" />
  </>
}

function TractorUnit() {
  return <g className="parade-truck">
    <path fill="#45483e" d="M310 132h190v7H310z" />
    <path fill="#292c2b" d="M334 58h43v6h11v11h10v26h15v6h18v-7h33v7h27v20H318V91h5V70h11z" />
    <path fill="#a45243" d="M335 63h38v5h12v12h9v22h13v15h-85V93h6V72h7z" />
    <path fill="#d58b6d" d="M335 64h36v5h-39v17h-4V73h7zm19 29h40v4h-40z" />
    <path fill="#3f5861" d="M336 73h31v15h-31zm36 1h9v8h7v7h-16z" />
    <path fill="#8caaa4" d="M339 75h25v3h-20v9h-5zm35 1h5v6h-5z" />
    <path fill="#5a403b" d="M368 90h3v22h-3zm15 3h8v4h-8z" />
    <path fill="#b9b6a0" d="M322 96h17v5h-17zm3 7h14v3h-14zm0 5h14v3h-14zm-8 7h23v5h-23z" />
    <path fill="#e3c68b" d="M321 103h5v6h-5z" />
    <path fill="#454e4a" d="M395 108h90v11h-90z" />
    <path fill="#a6a58e" d="M406 111h24v11h-24zm28-11h28v5h-28z" />
    <path fill="#d3bd91" d="M472 107h13v5h-13z" />
    {[351, 447, 475].map(x => (
      <g key={x} transform={`translate(${x} 122)`}>
        <path fill="#242c28" d="M-8-12H8v4h4V8H8v4H-8V8h-4V-8h4z" />
        <rect x="-5" y="-6" width="10" height="12" fill="#999a84" />
        <rect x="-3" y="-3" width="6" height="6" fill="#5d6253" />
      </g>
    ))}
  </g>
}

export function ParadeExhibit({ parade, revealed }: { parade: Parade; revealed: boolean }) {
  return <figure className="parade-exhibit" aria-label={parade.title}>
    <figcaption><span><Icon name="camera" size={17} />{parade.title}</span>{parade.location}</figcaption>
    <div className="parade-frame">
      <svg key={String(revealed)} className={revealed ? 'parade-wide' : undefined}
        viewBox={revealed ? '0 0 520 148' : '12 42 282 80'} preserveAspectRatio="xMidYMid slice"
        shapeRendering="crispEdges" aria-hidden="true">
        <Street />
        <CameraAndChild />
        {revealed && <TractorUnit />}
      </svg>
    </div>
  </figure>
}

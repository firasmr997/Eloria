import { useState } from 'react'
import { formatDate } from '@/utils/format'

interface DayCount {
  date: string
  count: number
}

/**
 * Requests per day, last 30 days. One series in espresso, so no legend: the title names it.
 * Bars are anchored to the baseline with 4px rounded top ends and 2px gaps; the grid is recessive;
 * every bar has a hover and keyboard tooltip, and a visually hidden table gives the exact values.
 */
export function RequestsChart({ data }: { data: DayCount[] }) {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(4, ...data.map((d) => d.count))
  const ticks = niceTicks(max)
  const top = ticks[ticks.length - 1]
  const W = 720
  const H = 220
  const pad = { l: 28, r: 4, t: 12, b: 26 }
  const plotW = W - pad.l - pad.r
  const plotH = H - pad.t - pad.b
  const slot = plotW / data.length
  const barW = Math.max(2, slot - 2)
  const total = data.reduce((n, d) => n + d.count, 0)

  return (
    <figure>
      <figcaption className="flex items-baseline justify-between gap-4">
        <span className="font-display text-xl text-ink">Requests, last 30 days</span>
        <span className="text-small text-ink-muted tabular">{total} in total</span>
      </figcaption>
      <div className="relative mt-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Appointment requests per day over the last 30 days, ${total} in total`}>
          {ticks.map((t) => {
            const y = pad.t + plotH - (t / top) * plotH
            return (
              <g key={t}>
                <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="var(--color-line)" strokeWidth="1" />
                <text x={pad.l - 8} y={y + 3.5} textAnchor="end" fontSize="10" fill="var(--color-ink-muted)" className="tabular">
                  {t}
                </text>
              </g>
            )
          })}
          {data.map((d, i) => {
            const h = (d.count / top) * plotH
            const x = pad.l + i * slot + 1
            const y = pad.t + plotH - h
            const r = Math.min(4, barW / 2, h)
            return (
              <g key={d.date}>
                {d.count > 0 && (
                  <path
                    d={`M${x},${pad.t + plotH} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${pad.t + plotH} Z`}
                    fill={active === i ? 'var(--color-champagne-deep)' : 'var(--color-espresso)'}
                  />
                )}
                {/* Hit target taller and wider than the mark. */}
                <rect
                  x={pad.l + i * slot}
                  y={pad.t}
                  width={slot}
                  height={plotH}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${formatDate(d.date, { day: 'numeric', month: 'long' })}: ${d.count} ${d.count === 1 ? 'request' : 'requests'}`}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="cursor-default focus:outline-none"
                />
              </g>
            )
          })}
          <line x1={pad.l} x2={W - pad.r} y1={pad.t + plotH} y2={pad.t + plotH} stroke="var(--color-line-strong)" />
          {[0, Math.floor(data.length / 2), data.length - 1].map((i) =>
            data[i] ? (
              <text key={i} x={pad.l + i * slot + slot / 2} y={H - 6} textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'} fontSize="10" fill="var(--color-ink-muted)">
                {formatDate(data[i].date, { day: 'numeric', month: 'short' })}
              </text>
            ) : null,
          )}
        </svg>
        {active !== null && data[active] && (
          <div
            className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-xs bg-espresso px-3 py-2 text-[0.75rem] whitespace-nowrap text-cream shadow-soft"
            style={{ left: `${((pad.l + active * slot + slot / 2) / W) * 100}%` }}
            role="status"
          >
            <span className="text-cream-muted">{formatDate(data[active].date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            <span className="ml-2 font-semibold tabular">{data[active].count}</span>
          </div>
        )}
      </div>
      <table className="sr-only">
        <caption>Requests per day</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Requests</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

function niceTicks(max: number): number[] {
  const step = max <= 4 ? 1 : max <= 10 ? 2 : max <= 25 ? 5 : Math.ceil(max / 5 / 5) * 5
  const top = Math.ceil(max / step) * step
  return Array.from({ length: top / step + 1 }, (_, i) => i * step)
}

/** Ranked single-hue bars with values as text: a breakdown, not a colour key. */
export function RankedBars({ title, rows, empty }: { title: string; rows: { label: string; value: number }[]; empty?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <figure>
      <figcaption className="font-display text-xl text-ink">{title}</figcaption>
      {rows.length === 0 ? (
        <p className="mt-4 text-small text-ink-muted">{empty ?? 'No data yet.'}</p>
      ) : (
        <ul className="mt-5 space-y-3.5">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex items-baseline justify-between gap-4 text-small">
                <span className="truncate text-ink">{r.label}</span>
                <span className="text-ink-muted tabular">{r.value}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-travertine">
                <div className="h-1.5 rounded-full bg-espresso" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </figure>
  )
}

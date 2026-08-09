import { SessionRun } from '../types'
import { Clock } from 'lucide-react'
import './HistoryPanel.css'

interface Props {
  history: SessionRun[]
  onSelect: (run: SessionRun) => void
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function HistoryPanel({ history, onSelect }: Props) {
  if (!history.length) return null

  return (
    <div className="history">
      <h3 className="history-heading serif">
        <Clock size={14} /> Session history
      </h3>
      <ul className="history-list">
        {history.map((run) => (
          <li key={run.id}>
            <button type="button" className="history-item" onClick={() => onSelect(run)}>
              <span className="history-name">{run.config.productName || 'Untitled'}</span>
              <span className="history-meta">
                {run.config.platform} · {run.scripts.length}v · {formatTime(run.timestamp)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

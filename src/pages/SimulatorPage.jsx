import { useState } from 'react'
import {
  GitCompareArrows,
  Link2,
  SquareStack,
  TableProperties,
} from 'lucide-react'
import SiteHeader from '../components/layout/SiteHeader.jsx'
import CompareView from '../components/simulator/CompareView.jsx'
import StrategyLab from '../components/simulator/StrategyLab.jsx'

const TABS = [
  { id: 'contigua', label: 'Contígua', icon: SquareStack },
  { id: 'encadeada', label: 'Encadeada', icon: Link2 },
  { id: 'indexada', label: 'Indexada', icon: TableProperties },
  { id: 'comparar', label: 'Comparar', icon: GitCompareArrows },
]

export default function SimulatorPage() {
  const [tab, setTab] = useState('contigua')

  return (
    <div className="sim-page">
      <SiteHeader />

      <div className="sim-page-title">
        <h1>Simulador de alocação em disco</h1>
      </div>

      <nav className="sim-tabs" aria-label="Modos do simulador">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`sim-tab${tab === id ? ' active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={18} strokeWidth={2.25} />
            {label}
          </button>
        ))}
      </nav>

      <div className="sim-page-body">
        {tab === 'comparar' && <CompareView />}
        {(tab === 'contigua' || tab === 'encadeada' || tab === 'indexada') && (
          <StrategyLab key={tab} strategy={tab} />
        )}
      </div>
    </div>
  )
}

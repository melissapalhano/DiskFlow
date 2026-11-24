import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Cpu } from 'lucide-react'

export default function SiteHeader() {
  const { pathname } = useLocation()
  const onSimulator = pathname.startsWith('/simulator')

  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Disk Flow, início">
        <span className="brand-icon">
          <Cpu size={22} />
        </span>
        <span>
          Disk <b>Flow</b>
        </span>
      </Link>

      <nav aria-label="Navegação principal">
        <a href="/#concepts">Fundamentos</a>
        <a href="/#simulator">Simulador</a>
        <a href="/#quiz">Quiz</a>
      </nav>

      {onSimulator ? (
        <span className="header-cta header-cta-spacer" aria-hidden="true" />
      ) : (
        <Link to="/simulator" className="header-cta">
          Entrar no simulador <ArrowRight size={15} />
        </Link>
      )}
    </header>
  )
}

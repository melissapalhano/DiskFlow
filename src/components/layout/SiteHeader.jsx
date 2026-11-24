import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Cpu } from 'lucide-react'

export default function SiteHeader() {
  const { pathname } = useLocation()
  const onSimulator = pathname.startsWith('/simulador')

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
        <a href="/#conceitos">Fundamentos</a>
        <a href="/#simulador">Simulador</a>
        <a href="/#quiz">Quiz</a>
      </nav>

      {onSimulator ? (
        <span className="header-cta header-cta-spacer" aria-hidden="true" />
      ) : (
        <Link to="/simulador" className="header-cta">
          Entrar no simulador <ArrowRight size={15} />
        </Link>
      )}
    </header>
  )
}

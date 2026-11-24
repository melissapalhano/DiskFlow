import { ArrowRight, Cpu } from 'lucide-react'

export default function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="Disk Flow, início">
        <span className="brand-icon">
          <Cpu size={22} />
        </span>
        <span>
          Disk <b>Flow</b>
        </span>
      </a>

      <nav aria-label="Navegação principal">
        <a href="#conceitos">Fundamentos</a>
        <a href="#simulador">Simulador</a>
        <a href="#quiz">Questionário</a>
      </nav>

      <a href="#simulador" className="header-cta">
        Ver simulador <ArrowRight size={15} />
      </a>
    </header>
  )
}

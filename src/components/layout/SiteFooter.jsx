import { Link } from 'react-router-dom'
import { Cpu } from 'lucide-react'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="brand" href="#home">
        <span className="brand-icon">
          <Cpu size={20} />
        </span>
        <span>
          Disk <b>Flow</b>
        </span>
      </a>
      <p>Sistemas Operacionais · Material educativo.</p>
      <Link to="/simulator">Entrar no simulador →</Link>
    </footer>
  )
}

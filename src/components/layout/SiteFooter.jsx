import { Cpu } from 'lucide-react'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="brand" href="#inicio">
        <span className="brand-icon">
          <Cpu size={20} />
        </span>
        <span>
          Disk <b>Flow</b>
        </span>
      </a>
      <p>Sistemas Operacionais · Material educativo.</p>
      <a href="#inicio">Voltar ao início ↑</a>
    </footer>
  )
}

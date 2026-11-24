import { Link } from 'react-router-dom'
import {
  ArrowRight,
  GitCompareArrows,
  Link2,
  Sparkles,
  SquareStack,
  TableProperties,
} from 'lucide-react'
import SectionLabel from '../SectionLabel.jsx'

const PREVIEWS = [
  {
    icon: SquareStack,
    title: 'Contígua',
    text: 'Blocos em sequência e leitura linear animada.',
  },
  {
    icon: Link2,
    title: 'Encadeada',
    text: 'Ponteiros saltando bloco a bloco pelo disco.',
  },
  {
    icon: TableProperties,
    title: 'Indexada',
    text: 'Tabela de índices com acesso direto.',
  },
]

export default function SimulatorSection() {
  return (
    <section className="simulator-section" id="simulador">
      <div className="section-heading">
        <SectionLabel number="02">ALOCAÇÃO DE ARQUIVOS</SectionLabel>
        <h2>
          Como os arquivos
          <br />
          ocupam o disco?
        </h2>
        <p>
          Um arquivo é dividido em blocos. No laboratório interativo você cria
          arquivos, compara estratégias e vê animações do acesso à memória.
        </p>
      </div>

      <div className="sim-teaser">
        <div className="sim-teaser-copy">
          <div className="eyebrow">
            <Sparkles size={14} /> SIMULADOR INTERATIVO
          </div>
          <h3>Abra o simulador interativo</h3>
          <p>
            Explore cada tipo de alocação, compare lado a lado e rode exemplos
            guiados com animação passo a passo.
          </p>
          <Link to="/simulador" className="hero-cta">
            Entrar no simulador <ArrowRight size={17} />
          </Link>
        </div>

        <div className="sim-teaser-grid">
          {PREVIEWS.map(({ icon: Icon, title, text }) => (
            <article key={title} className="sim-teaser-card">
              <span className="strategy-icon">
                <Icon size={18} />
              </span>
              <strong>{title}</strong>
              <small>{text}</small>
            </article>
          ))}
          <article className="sim-teaser-card highlight">
            <span className="strategy-icon">
              <GitCompareArrows size={18} />
            </span>
            <strong>Comparar</strong>
            <small>As três estratégias com o mesmo cenário.</small>
          </article>
        </div>
      </div>
    </section>
  )
}

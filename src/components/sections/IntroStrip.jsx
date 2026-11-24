import { ArrowRight, Cpu, HardDrive } from 'lucide-react'

export default function IntroStrip() {
  return (
    <section className="intro-strip">
      <div className="intro-item">
        <span className="intro-emoji">
          <Cpu size={20} />
        </span>
        <p>
          <strong>O que ele faz?</strong>
          <br />
          Organiza os programas e os componentes do computador.
        </p>
      </div>
      <div className="intro-divider" />
      <div className="intro-item">
        <span className="intro-emoji">
          <HardDrive size={20} />
        </span>
        <p>
          <strong>Programas e dispositivos</strong>
          <br />
          Trabalham em conjunto com sua coordenação.
        </p>
      </div>
      <a href="#conceitos" className="intro-link">
        Ver conceitos <ArrowRight size={16} />
      </a>
    </section>
  )
}

import {
  ArrowDown,
  Cpu,
  Folder,
  Image as ImageIcon,
  Music2,
} from 'lucide-react'

export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-copy">
        <div className="hero-tag">
          <Cpu size={15} /> SISTEMAS OPERACIONAIS
        </div>
        <h1>
          Como o computador
          <br />
          <span>organiza seus arquivos?</span>
        </h1>
        <p>
          Conheça o sistema operacional: o programa que coordena as tarefas e
          organiza os arquivos do computador.
        </p>
        <a className="hero-cta" href="#conceitos">
          Conhecer os conceitos <ArrowDown size={17} />
        </a>
        <div className="hero-note">
          <span>Conceitos fundamentais, exemplos visuais e simulações.</span>
        </div>
      </div>

      <div
        className="hero-art"
        aria-label="Ilustração de um computador com pastas organizadas"
      >
        <div className="floating-chip chip-one">
          <span>
            <Folder size={17} />
          </span>
          <b>Arquivos</b>
        </div>
        <div className="floating-chip chip-two">
          <span>
            <Cpu size={17} />
          </span>
          <b>Sistema operacional</b>
        </div>

        <div className="computer">
          <div className="screen">
            <div className="screen-bar">
              <i />
              <i />
              <i />
            </div>
            <div className="screen-content">
              <div className="screen-title">
                <span>Arquivos</span>
                <span>●</span>
              </div>
              <div className="folder-row">
                <div className="folder folder-yellow">
                  <ImageIcon size={18} />
                  <small>Imagem</small>
                </div>
                <div className="folder folder-green">
                  <Folder size={18} />
                  <small>Texto</small>
                </div>
                <div className="folder folder-purple">
                  <Music2 size={18} />
                  <small>Áudio</small>
                </div>
              </div>
              <div className="screen-message">
                <Cpu size={17} />
                <div>
                  <b>Sistema operacional</b>
                  <small>Coordena os recursos do computador</small>
                </div>
              </div>
            </div>
          </div>
          <div className="computer-neck" />
          <div className="computer-base" />
        </div>

        <div className="hero-caption">
          O sistema operacional coordena esses recursos.
        </div>
      </div>
    </section>
  )
}

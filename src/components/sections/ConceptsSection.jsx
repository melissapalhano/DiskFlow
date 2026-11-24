import {
  Cpu,
  Folder,
  Gamepad2,
  HardDrive,
  Image as ImageIcon,
  Info,
  Music2,
} from 'lucide-react'
import SectionLabel from '../SectionLabel.jsx'

const CONCEPTS = [
  {
    number: '01',
    tone: 'concept-lilac',
    icon: Folder,
    title: 'Gerencia arquivos',
    text: 'Organiza documentos e imagens em pastas. É como guardar cada material em uma gaveta identificada.',
    visual: (
      <div className="mini-visual mini-files">
        <span>
          <Folder size={16} />
        </span>
        <span>
          <ImageIcon size={16} />
        </span>
        <span>
          <Gamepad2 size={16} />
        </span>
        <span>
          <Music2 size={16} />
        </span>
      </div>
    ),
  },
  {
    number: '02',
    tone: 'concept-peach',
    icon: Cpu,
    title: 'Coordena dispositivos',
    text: 'Permite que teclado, tela, mouse e programas trabalhem em conjunto.',
    visual: (
      <div className="mini-visual mini-friends">
        <span>
          <Cpu size={16} />
        </span>
        <i>↔</i>
        <span>
          <HardDrive size={16} />
        </span>
        <i>↔</i>
        <span>
          <Folder size={16} />
        </span>
      </div>
    ),
  },
  {
    number: '03',
    tone: 'concept-mint',
    icon: HardDrive,
    title: 'Distribui recursos',
    text: 'O processador executa instruções. A memória guarda, por pouco tempo, as informações que os programas estão usando.',
    visual: (
      <div className="mini-visual mini-tasks">
        <span>Processador</span>
        <span>Memória</span>
        <span>Arquivos</span>
      </div>
    ),
  },
]

export default function ConceptsSection() {
  return (
    <section className="concepts-section" id="conceitos">
      <div className="section-heading">
        <SectionLabel number="01">CONCEITOS FUNDAMENTAIS</SectionLabel>
        <h2>
          O que faz um sistema
          <br />
          operacional?
        </h2>
        <p>
          É o programa que coordena o processador, a memória, os arquivos e os
          dispositivos. Pense nele como o organizador do computador.
        </p>
      </div>

      <div className="concept-grid">
        {CONCEPTS.map(({ number, tone, icon: Icon, title, text, visual }) => (
          <article key={number} className={`concept-card ${tone}`}>
            <div className="concept-emoji">
              <Icon size={23} />
            </div>
            <span className="concept-number">{number}</span>
            <h3>{title}</h3>
            <p>{text}</p>
            {visual}
          </article>
        ))}
      </div>

      <div className="memory-callout">
        <span>
          <Info size={18} />
        </span>
        <p>
          <strong>Em resumo:</strong> o sistema operacional organiza os recursos
          e permite que programas e dispositivos funcionem juntos.
        </p>
      </div>
    </section>
  )
}

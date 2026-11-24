import DiskSimulator from '../DiskSimulator.jsx'
import SectionLabel from '../SectionLabel.jsx'

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
          Um arquivo é dividido em blocos. O sistema operacional registra onde
          cada bloco foi armazenado e como encontrá-lo.
        </p>
      </div>
      <DiskSimulator />
    </section>
  )
}

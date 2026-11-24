import { HardDrive, Play, RotateCcw, Square } from 'lucide-react'
import { DEMO_SCENARIOS, useSimulation } from '../../simulation/index.js'
import DiskGrid from './DiskGrid.jsx'
import FileEditor from './FileEditor.jsx'
import MetaPanel from './MetaPanel.jsx'
import SettingsPanel from './SettingsPanel.jsx'

export default function StrategyLab({ strategy }) {
  const sim = useSimulation(strategy)
  const liveText = sim.step?.text ?? (sim.busy ? sim.message : null)

  return (
    <div className="strategy-lab lab-layout lab-layout-aligned">
      <aside className="lab-sidebar">
        <div className="select-wrap preset-select">
          <select
            className="cursor-pointer"
            value={sim.activePreset}
            disabled={sim.busy}
            aria-label="Selecione um exemplo"
            onChange={(event) => {
              if (!event.target.value) return
              sim.loadPreset(event.target.value)
            }}
          >
            <option value="" disabled>
              Selecione um exemplo
            </option>
            {DEMO_SCENARIOS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="sidebar-fill">
          <FileEditor
            key={sim.editorRevision}
            files={sim.files}
            selectedId={sim.selectedPlacement?.file.id}
            freeBlocks={sim.freeBlocks}
            busy={sim.busy}
            onSelect={sim.selectFile}
            onCreate={sim.createFile}
            onUpdate={sim.updateFile}
            onDelete={sim.deleteFile}
          />
        </div>
      </aside>

      <section className="lab-stage">
        <div className="lab-stage-card stage-fill">
          <div className="disk-heading stage-toolbar">
            <span className="disk-status">
              <HardDrive size={18} />
              Disco · {sim.occupied}/{sim.diskSize} ocupados
            </span>

            <div className="stage-actions">
              {sim.playing ? (
                <button
                  className="stage-btn"
                  type="button"
                  onClick={sim.stop}
                >
                  <Square size={14} /> Parar
                </button>
              ) : (
                <button
                  className="stage-btn stage-btn-primary"
                  type="button"
                  onClick={sim.startSimulation}
                  disabled={sim.busy || !sim.selectedPlacement}
                >
                  <Play size={16} />
                  Iniciar simulação
                </button>
              )}
              <button
                className="stage-btn"
                type="button"
                onClick={sim.reset}
                disabled={sim.busy}
              >
                <RotateCcw size={16} />
                Reiniciar
              </button>
            </div>
          </div>

          <DiskGrid
            blocks={sim.blocks}
            activeBlocks={sim.step?.active ?? []}
            trailBlocks={sim.step?.trail ?? []}
            allocatingBlocks={sim.allocating}
            columns={9}
          />

          <div className="sim-message lab-live" aria-live="polite">
            <span>{liveText || '\u00A0'}</span>
          </div>
        </div>

        <div className="lab-below lab-below-equal">
          <SettingsPanel
            diskSize={sim.diskSize}
            timingPreset={sim.timingPreset}
            onDiskSizeChange={sim.changeDiskSize}
            onTimingPresetChange={sim.changeTimingPreset}
            busy={sim.busy}
          />

          <MetaPanel
            strategy={strategy}
            placement={sim.selectedPlacement}
            showIndex={Boolean(sim.step?.showIndex)}
            estimate={sim.lastEstimate ?? sim.previewEstimate}
            elapsed={sim.step?.elapsed}
          />
        </div>
      </section>
    </div>
  )
}

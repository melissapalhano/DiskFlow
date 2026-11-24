import { Settings } from 'lucide-react'
import { DISK_SIZE_OPTIONS } from '../../simulation/index.js'
import { TIMING_PRESETS } from '../../simulation/timingPresets.js'

export default function SettingsPanel({
  diskSize,
  timingPreset = 'balanced',
  onDiskSizeChange,
  onTimingPresetChange,
  busy = false,
}) {
  const preset = TIMING_PRESETS[timingPreset] ?? TIMING_PRESETS.balanced

  return (
    <div className="settings-panel">
      <div className="settings-title">
        <Settings size={16} />
        Configurações
      </div>

      <div className="settings-body">
        <label className="field">
          <span>Tamanho do disco</span>
          <div className="select-wrap">
            <select
              value={diskSize}
              disabled={busy}
              onChange={(event) => onDiskSizeChange(Number(event.target.value))}
            >
              {DISK_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} blocos
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="field">
          <span>Custo de tempo</span>
          <div className="select-wrap">
            <select
              value={preset.id}
              disabled={busy}
              onChange={(event) => onTimingPresetChange(event.target.value)}
            >
              {Object.values(TIMING_PRESETS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>
    </div>
  )
}

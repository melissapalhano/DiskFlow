import { useState } from 'react'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import {
  FILE_COLORS,
  buildFile,
  nextFileColor,
  suggestFileName,
} from '../../simulation/index.js'

function createForm(files) {
  return {
    name: suggestFileName(files),
    blocks: 3,
    color: nextFileColor(files),
  }
}

export default function FileEditor({
  files,
  selectedId,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  freeBlocks,
  busy = false,
}) {
  const [mode, setMode] = useState('create')
  const [form, setForm] = useState(() => createForm(files))
  const [error, setError] = useState('')

  const startCreate = () => {
    setMode('create')
    setForm(createForm(files))
    setError('')
  }

  const startEdit = (file) => {
    onSelect(file.id)
    setMode('edit')
    setForm({
      id: file.id,
      name: file.name,
      blocks: file.blocks,
      color: file.color,
    })
    setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    const draft = buildFile(form)

    if (!draft.name.trim()) {
      setError('Informe um nome para o arquivo.')
      return
    }

    const nameTaken = files.some(
      (file) =>
        file.name.toLowerCase() === draft.name.toLowerCase() &&
        file.id !== form.id,
    )
    if (nameTaken) {
      setError('Já existe um arquivo com esse nome.')
      return
    }

    if (mode === 'create') {
      if (draft.blocks > freeBlocks) {
        setError(`Só há ${freeBlocks} bloco(s) livre(s).`)
        return
      }
      const ok = await onCreate(draft)
      if (ok === false) return
      setForm(createForm([...files, draft]))
      setError('')
      return
    }

    const current = files.find((file) => file.id === form.id)
    const delta = draft.blocks - (current?.blocks ?? 0)
    if (delta > freeBlocks) {
      setError(`Não há espaço para aumentar ${delta} bloco(s).`)
      return
    }

    const ok = await onUpdate(draft)
    if (ok === false) return
    startCreate()
  }

  return (
    <div className="file-editor">
      <form className="file-form file-form-top" onSubmit={submit}>
        {mode === 'edit' && (
          <div className="file-form-title">
            <Pencil size={14} /> Editar arquivo
          </div>
        )}

        <div className="color-field">
          <span>Cor</span>
          <div className="color-swatches" role="group" aria-label="Cor do arquivo">
            {FILE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-swatch${form.color === color ? ' selected' : ''}`}
                style={{ backgroundColor: color }}
                aria-label={`Cor ${color}`}
                disabled={busy}
                onClick={() => setForm((current) => ({ ...current, color }))}
              />
            ))}
          </div>
        </div>

        <label>
          Nome
          <input
            type="text"
            maxLength={20}
            value={form.name}
            disabled={busy}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Ex.: Relatório"
          />
        </label>

        <label>
          Tamanho (blocos)
          <input
            type="number"
            min={1}
            max={12}
            value={form.blocks}
            disabled={busy}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                blocks: Number(event.target.value),
              }))
            }
          />
        </label>

        {error && <p className="file-form-error">{error}</p>}

        <div className="file-form-actions">
          {mode === 'edit' && (
            <button
              type="button"
              className="action-button"
              onClick={startCreate}
              disabled={busy}
            >
              <X size={14} /> Cancelar
            </button>
          )}
          <button className="action-button add" type="submit" disabled={busy}>
            {mode === 'edit' ? (
              <>
                <Check size={14} /> Salvar
              </>
            ) : (
              'Adicionar arquivo'
            )}
          </button>
        </div>
      </form>

      <div className="file-editor-head">
        <h4>Arquivos no disco</h4>
        <span>
          {files.length} arquivo{files.length === 1 ? '' : 's'}
        </span>
      </div>

      <ul className="file-list">
        {files.map((file) => (
          <li
            key={file.id}
            className={`file-row${selectedId === file.id ? ' selected' : ''}`}
          >
            <button
              type="button"
              className="file-row-main"
              onClick={() => onSelect(file.id)}
              disabled={busy}
            >
              <i style={{ backgroundColor: file.color }} />
              <span>
                <strong>{file.name}</strong>
                <small>
                  {file.blocks} bloco{file.blocks > 1 ? 's' : ''}
                </small>
              </span>
            </button>
            <div className="file-row-actions">
              <button
                type="button"
                className="icon-btn"
                aria-label={`Editar ${file.name}`}
                onClick={() => startEdit(file)}
                disabled={busy}
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                className="icon-btn danger"
                aria-label={`Excluir ${file.name}`}
                onClick={() => onDelete(file.id)}
                disabled={busy}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

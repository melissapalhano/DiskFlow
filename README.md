# Disk Flow

Material educativo sobre sistemas operacionais: conceitos, simulador de alocação em disco e questionário.

## Como rodar

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — preview do build
- `npm run lint` — oxlint

## Estrutura

```
src/
  components/     # UI (layout, seções, simulador, quiz)
  data/           # Dados estáticos (arquivos iniciais, perguntas)
  lib/            # Lógica pura (alocação de blocos)
  App.jsx
  main.jsx
  index.css
```

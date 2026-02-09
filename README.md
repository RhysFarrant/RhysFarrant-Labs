# RhysFarrant Labs

Single React + Vite labs app for `labs.rhysfarrant.com`.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

## Routes

- `/` -> labs index
- `/<slug>` -> registered lab page
- `*` -> not found

## Add a new lab

1. Create `src/labs/<slug>/index.tsx` and export a default React component.
2. Register it in `src/data/labs.ts` with metadata and lazy import.
3. It appears on `/` and is routed automatically.

## Local development

```bash
npm install
npm run dev
```

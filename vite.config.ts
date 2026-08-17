import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Production is served from https://blackouths.github.io/bg3-party-planner/;
  // the dev server stays at the root so localhost:5173 keeps working.
  base: command === 'build' ? '/bg3-party-planner/' : '/',
  plugins: [react()],
}));

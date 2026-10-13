import { defineConfig } from 'vite';

const pagesBase = process.env.PAGES_BASE_PATH;

export default defineConfig({
  base: pagesBase ? `${pagesBase.replace(/\/$/, '')}/` : './',
});

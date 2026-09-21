import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { localEditorPlugin } from './tools/editor/localEditorServer.ts';

export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [react(), ...(mode === 'editor' ? [localEditorPlugin()] : [])],
  build: {
    outDir: 'dist',
  },
}));

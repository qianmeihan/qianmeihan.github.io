import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { portraitPreloadPlugin } from './tools/build/portraitPreload.ts';
import { localEditorPlugin } from './tools/editor/localEditorServer.ts';

export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [
    portraitPreloadPlugin(),
    react(),
    ...(mode === 'editor' ? [localEditorPlugin()] : []),
  ],
  build: {
    outDir: 'dist',
  },
}));

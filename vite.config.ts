import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function adminDirectoryIndex() {
  const redirectAdmin = (
    request: { url?: string },
    response: { statusCode: number; setHeader: (name: string, value: string) => void; end: () => void },
    next: () => void,
  ) => {
    if (request.url === '/admin/' || request.url?.startsWith('/admin/?')) {
      response.statusCode = 302;
      response.setHeader('Location', '/admin/index.html');
      response.end();
      return;
    }
    next();
  };

  return {
    name: 'admin-directory-index',
    configureServer(server: { middlewares: { use: (handler: typeof redirectAdmin) => void } }) {
      server.middlewares.use(redirectAdmin);
    },
    configurePreviewServer(server: { middlewares: { use: (handler: typeof redirectAdmin) => void } }) {
      server.middlewares.use(redirectAdmin);
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [react(), adminDirectoryIndex()],
  build: {
    outDir: 'dist',
  },
});

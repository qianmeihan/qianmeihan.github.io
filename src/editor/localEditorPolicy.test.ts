import { describe, expect, it } from 'vitest';
import packageJson from '../../package.json';

const publicAdminFiles = import.meta.glob('../../public/admin/**', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const editorFiles = import.meta.glob('../../tools/editor/*', {
  eager: true,
  query: '?raw',
  import: 'default',
});

describe('local-only portfolio editor policy', () => {
  it('removes the public CMS and keeps editor source outside public', () => {
    expect(Object.keys(publicAdminFiles)).toEqual([]);
    expect(Object.keys(editorFiles)).toEqual(
      expect.arrayContaining([
        '../../tools/editor/index.html',
        '../../tools/editor/editor.js',
        '../../tools/editor/editor.css',
      ]),
    );
  });

  it('offers a loopback-only editor command', () => {
    expect(packageJson.scripts?.editor).toBe(
      'vite --mode editor --host 127.0.0.1 --port 4173 --open /__editor/',
    );
  });
});

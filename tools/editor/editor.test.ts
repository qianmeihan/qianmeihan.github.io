import { waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

it('renders bilingual work copy without an obsolete featured control', async () => {
  document.body.innerHTML = `
    <form id="editor-form"></form>
    <button id="save"></button>
    <button id="reload"></button>
    <button id="refresh-preview"></button>
    <span id="status"></span>
    <iframe id="preview"></iframe>
  `;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        meta: { updatedAt: '2026-09-22', defaultLocale: 'zh' },
        experience: [{
          id: 'bmw',
          context: { zh: '宝马华晨项目', en: 'BMW Brilliance Project' },
          role: { zh: '产品工程师', en: 'Product Engineer' },
          summary: { zh: '参与产品工程。', en: 'Supports product engineering.' },
          highlights: [{ zh: '跟进工程信息', en: 'Follows engineering information' }],
        }],
      }),
    }),
  );

  // @ts-expect-error The editor is a browser-delivered JavaScript module.
  await import('./editor.js?work-copy-test');

  await waitFor(() => {
    const controls = [...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea')];
    expect(controls.some((control) => control.value === '宝马华晨项目')).toBe(true);
    expect(controls.some((control) => control.value === 'BMW Brilliance Project')).toBe(true);
    expect(document.querySelector('#editor-form')).toHaveTextContent('工作要点');
    expect(document.querySelector('input[type="checkbox"]')).toBeNull();
  });
});

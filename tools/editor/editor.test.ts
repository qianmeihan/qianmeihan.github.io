import { waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

it('renders boolean content fields as labeled checkboxes', async () => {
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
        experience: [{ id: 'schaeffler', featured: true }],
      }),
    }),
  );

  // @ts-expect-error The editor is a browser-delivered JavaScript module.
  await import('./editor.js?checkbox-test');

  await waitFor(() => {
    const checkbox = document.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    expect(checkbox).not.toBeNull();
    expect(checkbox?.checked).toBe(true);
    expect(checkbox?.closest('label')).toHaveTextContent('重点经历');
  });
});

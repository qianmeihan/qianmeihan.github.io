import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { validateSiteContent } from '../../src/content/validateSiteContent.ts';
import type { SiteContent } from '../../src/content/types.ts';

const MAX_CONTENT_BYTES = 2 * 1024 * 1024;
const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
const ALLOWED_MEDIA_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const FORBIDDEN_KEYS = new Set([
  'address',
  'currentemployer',
  'employer',
  'identitynumber',
  'organization',
  'password',
  'phone',
  'salary',
  'secret',
  'token',
]);
const FORBIDDEN_TEXT = [
  '优化算法',
  '生产计划',
  '库存优化',
  '家庭住址',
  '身份证',
  '手机号',
  '薪资',
  '账号密码',
  '访问令牌',
  'optimization algorithm',
  'production planning',
  'inventory optimization',
  'home address',
  'identity number',
  'phone number',
  'access token',
];

function inspectPublicValue(value: unknown, path = 'content'): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectPublicValue(item, `${path}[${index}]`));
    return;
  }

  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
        throw new Error(`${path}.${key} is not allowed in public content`);
      }
      inspectPublicValue(child, `${path}.${key}`);
    }
    return;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    const forbidden = FORBIDDEN_TEXT.find((term) => normalized.includes(term));
    if (forbidden) {
      throw new Error(`${path} contains excluded public topic: ${forbidden}`);
    }
  }
}

export function validateEditorContent(value: unknown): SiteContent {
  inspectPublicValue(value);
  return validateSiteContent(value);
}

export async function writeSiteContentAtomic(
  value: unknown,
  contentPath: string,
): Promise<SiteContent> {
  const validated = validateEditorContent(value);
  const temporaryPath = `${contentPath}.tmp`;
  await mkdir(dirname(contentPath), { recursive: true });

  try {
    await writeFile(temporaryPath, `${JSON.stringify(validated, null, 2)}\n`, 'utf8');
    await rename(temporaryPath, contentPath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }

  return validated;
}

function safeMediaFilename(filename: string): string {
  const originalExtension = extname(filename);
  const extension = originalExtension.toLowerCase();
  if (!ALLOWED_MEDIA_EXTENSIONS.has(extension)) {
    throw new Error('Only JPG, PNG, or WebP images can be uploaded');
  }

  const outputExtension = extension === '.jpeg' ? '.jpg' : extension;
  const stem = basename(filename, originalExtension)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return `${stem || 'portfolio-image'}${outputExtension}`;
}

export async function saveMediaFile(
  bytes: Uint8Array,
  filename: string,
  mediaDirectory: string,
): Promise<string> {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_MEDIA_BYTES) {
    throw new Error('Image must be between 1 byte and 10 MB');
  }

  const outputName = safeMediaFilename(filename);
  await mkdir(mediaDirectory, { recursive: true });
  await writeFile(resolve(mediaDirectory, outputName), bytes);
  return `/media/${outputName}`;
}

async function readRequestBody(
  request: IncomingMessage,
  maximumBytes: number,
): Promise<Uint8Array> {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += bytes.byteLength;
    if (total > maximumBytes) throw new Error('Request is too large');
    chunks.push(bytes);
  }

  return Buffer.concat(chunks);
}

function send(
  response: ServerResponse,
  statusCode: number,
  body: string | Uint8Array,
  contentType: string,
): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', contentType);
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(body);
}

function isLoopbackRequest(request: IncomingMessage): boolean {
  const host = request.headers.host?.split(':')[0].replace(/^\[|\]$/g, '');
  if (host !== '127.0.0.1' && host !== 'localhost' && host !== '::1') return false;

  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    return originUrl.host === request.headers.host;
  } catch {
    return false;
  }
}

export function localEditorPlugin(projectRoot = process.cwd()): Plugin {
  const editorDirectory = resolve(projectRoot, 'tools/editor');
  const contentPath = resolve(projectRoot, 'public/content/site.json');
  const mediaDirectory = resolve(projectRoot, 'public/media');

  return {
    name: 'qian-local-editor',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        void (async () => {
          const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
          if (!requestUrl.pathname.startsWith('/__editor')) {
            next();
            return;
          }

          if (!isLoopbackRequest(request)) {
            send(response, 403, 'Local editor is available only on this computer.', 'text/plain; charset=utf-8');
            return;
          }

          try {
            if (request.method === 'GET' && requestUrl.pathname === '/__editor/api/content') {
              send(response, 200, await readFile(contentPath), 'application/json; charset=utf-8');
              return;
            }

            if (request.method === 'POST' && requestUrl.pathname === '/__editor/api/content') {
              const body = await readRequestBody(request, MAX_CONTENT_BYTES);
              const saved = await writeSiteContentAtomic(JSON.parse(Buffer.from(body).toString('utf8')), contentPath);
              send(response, 200, JSON.stringify({ ok: true, content: saved }), 'application/json; charset=utf-8');
              return;
            }

            if (request.method === 'POST' && requestUrl.pathname === '/__editor/api/media') {
              const filename = requestUrl.searchParams.get('filename') ?? '';
              const body = await readRequestBody(request, MAX_MEDIA_BYTES);
              const publicPath = await saveMediaFile(body, filename, mediaDirectory);
              send(response, 200, JSON.stringify({ ok: true, path: publicPath }), 'application/json; charset=utf-8');
              return;
            }

            const asset = requestUrl.pathname === '/__editor/' || requestUrl.pathname === '/__editor/index.html'
              ? 'index.html'
              : requestUrl.pathname.replace('/__editor/', '');
            if (!['index.html', 'editor.js', 'editor.css'].includes(asset)) {
              send(response, 404, 'Not found', 'text/plain; charset=utf-8');
              return;
            }

            const mime = asset.endsWith('.js')
              ? 'text/javascript; charset=utf-8'
              : asset.endsWith('.css')
                ? 'text/css; charset=utf-8'
                : 'text/html; charset=utf-8';
            send(response, 200, await readFile(resolve(editorDirectory, asset)), mime);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown editor error';
            send(response, 400, JSON.stringify({ ok: false, error: message }), 'application/json; charset=utf-8');
          }
        })();
      });
    },
  };
}

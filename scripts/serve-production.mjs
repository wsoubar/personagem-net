// Servidor local para testar o build com fallback de rotas. Não é servidor de produção.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('dist/personagens/browser');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const target = resolve(root, `.${pathname}`);
    if (target !== root && !target.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    const file = extname(target) ? target : resolve(root, 'index.html');
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' });
    response.end(body);
  } catch { response.writeHead(404).end(); }
}).listen(4300, '127.0.0.1');

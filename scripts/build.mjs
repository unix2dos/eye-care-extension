import { mkdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(rootDir, '..');
const distDir = path.join(projectDir, 'dist');
const publicDir = path.join(projectDir, 'public');
const popupDir = path.join(projectDir, 'src', 'popup');
const optionsDir = path.join(projectDir, 'src', 'options');

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(publicDir, distDir, { recursive: true });
await mkdir(path.join(distDir, 'popup'), { recursive: true });
await mkdir(path.join(distDir, 'options'), { recursive: true });
await mkdir(path.join(distDir, 'content'), { recursive: true });
await mkdir(path.join(distDir, 'background'), { recursive: true });

await Promise.all([
  cp(path.join(popupDir, 'index.html'), path.join(distDir, 'popup', 'index.html')),
  cp(path.join(optionsDir, 'index.html'), path.join(distDir, 'options', 'index.html'))
]);

await esbuild.build({
  entryPoints: {
    'background/main': path.join(projectDir, 'src', 'background', 'main.ts'),
    'content/main': path.join(projectDir, 'src', 'content', 'main.ts'),
    'popup/main': path.join(projectDir, 'src', 'popup', 'main.ts'),
    'options/main': path.join(projectDir, 'src', 'options', 'main.ts')
  },
  outdir: distDir,
  bundle: true,
  format: 'esm',
  target: 'es2022',
  sourcemap: true
});

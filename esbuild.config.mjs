import * as esbuild from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';

const isServe = process.argv.includes('--serve');

const html = (assetPrefix = '.') => `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EA Modeler JS MVP - esbuild</title>
    <link rel="stylesheet" href="${assetPrefix}/app.css" />
  </head>
  <body>
    <div id="root"></div>
    <script src="${assetPrefix}/app.js"></script>
  </body>
</html>
`;

const options = {
  entryPoints: ['src/main.jsx'],
  bundle: true,
  outfile: 'dist/app.js',
  format: 'iife',
  globalName: 'EAModelerBundle',
  jsx: 'automatic',
  minify: !isServe,
  sourcemap: isServe,
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx',
    '.svg': 'dataurl',
    '.png': 'dataurl',
    '.jpg': 'dataurl',
    '.jpeg': 'dataurl',
    '.gif': 'dataurl',
    '.woff': 'dataurl',
    '.woff2': 'dataurl',
    '.ttf': 'dataurl'
  },
  logLevel: 'info'
};

await mkdir('dist', { recursive: true });

if (isServe) {
  await writeFile('index.html', html('./dist'));

  const ctx = await esbuild.context(options);
  await ctx.watch();
  const server = await ctx.serve({ servedir: '.', host: '0.0.0.0', port: 5173 });
  console.log(`dev server: http://${server.host}:${server.port}`);
} else {
  await esbuild.build(options);
  await writeFile('dist/index.html', html('.'));
}

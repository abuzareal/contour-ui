import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build, preview } from "vite";
const directory = await mkdtemp(join(tmpdir(), "contour-qa-"));
await writeFile(
  join(directory, "index.html"),
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contour QA fixture</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
await writeFile(
  join(directory, "main.tsx"),
  `import React from ${JSON.stringify(resolve("node_modules/react/index.js"))};import{createRoot}from ${JSON.stringify(resolve("node_modules/react-dom/client.js"))};import Fixture from ${JSON.stringify(resolve("tests/qa/Fixture.tsx"))};import ${JSON.stringify(resolve("dist/scoped.css"))};import ${JSON.stringify(resolve("dist/fonts-latin.css"))};import './fixture.css';createRoot(document.getElementById('root')).render(<Fixture/>);`,
);
await writeFile(
  join(directory, "fixture.css"),
  "body{margin:0}.qa-page{max-width:680px;min-height:100vh;box-sizing:border-box;margin:auto;padding:24px;background:var(--contour-bg);color:var(--contour-fg);font-family:'DM Sans Variable',sans-serif}.qa-page h1{font-size:28px;line-height:1.2}.qa-page h2{font-size:20px}.qa-page p{line-height:1.5}.qa-surface{padding:16px;border:1px solid currentColor}.qa-surface form{display:grid;gap:20px;margin-top:20px}.qa-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}output{display:block;overflow-wrap:anywhere;margin-top:12px}.qa-page [id=details]{margin-top:32px}",
);
try {
  await build({
    root: directory,
    configFile: false,
    logLevel: "warn",
    resolve: {
      alias: {
        "@abuzareal/contour-ui": resolve("dist/index.js"),
        react: resolve("node_modules/react"),
        "react-dom": resolve("node_modules/react-dom"),
      },
    },
  });
  const server = await preview({
    root: directory,
    configFile: false,
    preview: { host: "127.0.0.1", port: 5177, strictPort: true },
  });
  const close = async () => {
    await new Promise((resolve) => server.httpServer.close(resolve));
    await rm(directory, { recursive: true, force: true });
    process.exit(0);
  };
  process.once("SIGTERM", close);
  process.once("SIGINT", close);
} catch (error) {
  await rm(directory, { recursive: true, force: true });
  throw error;
}

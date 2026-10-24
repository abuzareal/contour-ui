import assert from "node:assert/strict";
import {
  readFile,
  writeFile,
  mkdtemp,
  mkdir,
  readdir,
  stat,
  rm,
} from "node:fs/promises";
import { execFileSync, spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve, relative } from "node:path";
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { build, preview } from "vite";
import { chromium } from "@playwright/test";
import { packedArchive } from "./packed-archive.mjs";
import { sizeFixtures, selectiveStyles } from "./size-fixtures.mjs";
const nextVersion = "16.4.3",
  reactVersion = "19.3.0";
const temporary = await mkdtemp(join(tmpdir(), "contour-size-"));
const output = resolve(
  process.env.CONTOUR_SIZE_OUTPUT ?? join(temporary, "sizes.json"),
);
const nextEnabled = process.env.CONTOUR_SIZE_NEXT !== "0";
const report = {
  metadata: {
    node: process.version,
    react: reactVersion,
    next: nextEnabled ? nextVersion : null,
    vite: JSON.parse(await readFile("node_modules/vite/package.json", "utf8"))
      .version,
    compression:
      "gzip level 9 per file; independent gzip samples are not summed into an application total",
    externalDependencies: [],
    excluded:
      "Source maps, images (none in fixtures), optional Three.js/Lenis entries; Next disk totals include only fetched client assets, not server output",
    network:
      "Fresh page requests after DOM/network idle and document.fonts.ready; transfer/encoded/decoded bytes from Resource Timing plus navigation",
  },
  vite: {},
  next: {},
};
let browser, server;
report.metadata.sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
report.metadata.workingTreeDirty =
  execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim()
    .length > 0;
report.metadata.playwright = JSON.parse(
  await readFile("node_modules/@playwright/test/package.json", "utf8"),
).version;
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function bytesIn(path) {
  let total = 0;
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const file = join(path, entry.name);
    if (entry.isDirectory()) total += await bytesIn(file);
    else if (entry.isFile()) total += (await stat(file)).size;
  }
  return total;
}
async function installCost(root) {
  const seen = new Set(),
    packages = [];
  async function visit(name, from) {
    let parent = from,
      directory;
    while (parent !== "/") {
      const candidate = join(parent, "node_modules", name);
      try {
        await stat(join(candidate, "package.json"));
        directory = candidate;
        break;
      } catch {}
      parent = resolve(parent, "..");
    }
    if (!directory || seen.has(directory)) return;
    seen.add(directory);
    const manifest = JSON.parse(
      await readFile(join(directory, "package.json"), "utf8"),
    );
    packages.push({
      name: manifest.name,
      version: manifest.version,
      bytes: await bytesIn(directory),
    });
    for (const dependency of Object.keys(manifest.dependencies ?? {}))
      await visit(dependency, directory);
  }
  await visit("@abuzareal/contour-ui", root);
  return packages;
}
async function inspectPage(origin, route, diskRoot, name) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 740 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.goto(origin + route, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator("h1").count(), 1);
    // Validate fetched family styles in the actual production DOM, not only emitted bytes.
    const styling = await page.evaluate((name) => {
      const styled = (selector) => {
        const node = document.querySelector(selector);
        return node ? getComputedStyle(node) : null;
      };
      const button = styled(".button"),
        field = styled(".field-control"),
        track = styled(".switch-track"),
        table = styled(".data-table"),
        scroll = styled(".table-scroll");
      return {
        buttonDisplay: button?.display,
        buttonHeight: button?.height,
        buttonBorder: button?.borderTopWidth,
        fieldBorder: field?.borderBottomWidth,
        switchWidth: track?.width,
        tableMinimum: table?.minWidth,
        tableCollapse: table?.borderCollapse,
        tableOverflow: scroll?.overflowX,
      };
    }, name);
    assert.equal(styling.buttonDisplay, "inline-flex");
    assert.ok(parseFloat(styling.buttonHeight) >= 32);
    assert.equal(styling.buttonBorder, "1px");
    if (name === "settings") {
      assert.equal(styling.fieldBorder, "1px");
      assert.equal(styling.switchWidth, "44px");
    }
    if (name === "table") {
      assert.equal(styling.fieldBorder, "1px");
      assert.equal(styling.tableMinimum, "560px");
      assert.equal(styling.tableCollapse, "collapse");
      assert.equal(styling.tableOverflow, "auto");
    }
    const entries = await page.evaluate(() =>
      [
        ...performance.getEntriesByType("navigation"),
        ...performance.getEntriesByType("resource"),
      ].map((e) => ({
        url: e.name,
        type: e.entryType,
        transferSize: e.transferSize,
        encodedBodySize: e.encodedBodySize,
        decodedBodySize: e.decodedBodySize,
      })),
    );
    const files = [];
    for (const entry of entries) {
      const pathname = new URL(entry.url).pathname;
      let path;
      if (pathname.startsWith("/_next/static/"))
        path = join(diskRoot, ".next", pathname.replace("/_next/", ""));
      else if (/\.(?:js|css|woff2)(?:$|\?)/.test(pathname))
        path = join(diskRoot, "dist", pathname);
      if (path) {
        const contents = await readFile(path);
        files.push({
          path: pathname,
          category: pathname.endsWith(".css")
            ? "css"
            : pathname.endsWith(".woff2")
              ? "fonts"
              : "js",
          bytes: contents.length,
          gzipBytes: gzipSync(contents, { level: 9 }).length,
        });
      }
    }
    assert.deepEqual(errors, []);
    return {
      styling,
      files,
      network: entries,
      networkTotals: entries.reduce(
        (s, e) => ({
          transferSize: s.transferSize + e.transferSize,
          encodedBodySize: s.encodedBodySize + e.encodedBodySize,
          decodedBodySize: s.decodedBodySize + e.decodedBodySize,
        }),
        { transferSize: 0, encodedBodySize: 0, decodedBodySize: 0 },
      ),
    };
  } finally {
    await page.close();
  }
}
async function closeServer() {
  if (!server) return;
  if (server.httpServer) await new Promise((r) => server.httpServer.close(r));
  else {
    const exited = new Promise((r) => server.once("exit", r));
    server.kill();
    await exited;
  }
  server = undefined;
}
try {
  const archive = await packedArchive(temporary),
    archiveBytes = await readFile(archive);
  const tar = gunzipSync(archiveBytes);
  let files = 0,
    unpackedBytes = 0;
  for (let cursor = 0; cursor + 512 <= tar.length;) {
    const header = tar.subarray(cursor, cursor + 512);
    if (header.every((byte) => byte === 0)) break;
    const length =
      Number.parseInt(
        header.subarray(124, 136).toString().replace(/\0/g, ""),
        8,
      ) || 0;
    const type = header[156];
    if (type === 0 || type === 48) {
      files++;
      unpackedBytes += length;
    }
    cursor += 512 + Math.ceil(length / 512) * 512;
  }
  report.metadata.archive = {
    sha256: hash(archiveBytes),
    compressedBytes: archiveBytes.length,
    unpackedBytes,
    files,
  };
  const fixture = join(temporary, "consumer");
  await mkdir(fixture);
  await writeFile(
    join(fixture, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "@abuzareal/contour-ui": `file:${archive}`,
        react: reactVersion,
        "react-dom": reactVersion,
        "lucide-react": "^1.49.0",
        ...(nextEnabled ? { next: nextVersion } : {}),
      },
    }),
  );
  execFileSync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--strict-peer-deps",
      "--no-audit",
      "--no-fund",
      "--cache",
      join(tmpdir(), "contour-size-npm-cache"),
    ],
    { cwd: fixture, stdio: "inherit" },
  );
  const library = JSON.parse(
    await readFile(
      join(fixture, "node_modules/@abuzareal/contour-ui/package.json"),
      "utf8",
    ),
  );
  report.metadata.package = {
    name: library.name,
    version: library.version,
    dependencies: library.dependencies,
  };
  report.metadata.lockfileSha256 = hash(
    await readFile(join(fixture, "package-lock.json")),
  );
  for (const peer of ["three", "lenis", "react-hook-form"])
    await assert.rejects(stat(join(fixture, "node_modules", peer)), {
      code: "ENOENT",
    });
  report.install = {
    libraryDependencyClosure: await installCost(fixture),
    peerPackages: await Promise.all(
      ["react", "react-dom"].map(async (name) => ({
        name,
        bytes: await bytesIn(join(fixture, "node_modules", name)),
      })),
    ),
    excluding: "Next/Vite/tooling/dev dependencies; optional peers are absent",
  };
  const fontPackages = report.install.libraryDependencyClosure.filter((p) =>
    p.name.startsWith("@fontsource"),
  );
  report.install.fontPackages = fontPackages;
  report.install.lucide = report.install.libraryDependencyClosure.find(
    (p) => p.name === "lucide-react",
  );
  report.fonts = {
    latinShippedBytes: await bytesIn(
      join(fixture, "node_modules/@abuzareal/contour-ui/dist/fonts"),
    ),
    note: "Includes license text; exact requested font bytes are recorded per fixture. Broader fonts.css retains installed Fontsource coverage.",
  };
  browser = await chromium.launch();
  report.metadata.chromium = browser.version();
  const aggregate = library.exports["./scoped.css"] ? "scoped" : "styles";
  for (const [name, source] of Object.entries(sizeFixtures))
    for (const variant of ["aggregate", "selective"]) {
      if (variant === "selective" && aggregate === "styles") continue;
      const css = variant === "selective" ? selectiveStyles[name] : [aggregate];
      await writeFile(
        join(fixture, "index.html"),
        '<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/main.jsx"></script></body></html>',
      );
      await writeFile(join(fixture, "demo.jsx"), source);
      await writeFile(
        join(fixture, "main.jsx"),
        `import React from 'react';import {createRoot} from 'react-dom/client';import Demo from './demo.jsx';${css.map((entry) => `import '@abuzareal/contour-ui/${entry}.css';`).join("")}createRoot(document.getElementById('root')).render(<Demo/>);`,
      );
      await build({ root: fixture, configFile: false, logLevel: "warn" });
      server = await preview({
        root: fixture,
        configFile: false,
        preview: { host: "127.0.0.1", port: 0 },
      });
      report.vite[name + "-" + variant] = await inspectPage(
        `http://127.0.0.1:${server.httpServer.address().port}`,
        "/",
        fixture,
        name,
      );
      await closeServer();
    }
  if (nextEnabled) {
    await mkdir(join(fixture, "app"), { recursive: true });
    await writeFile(
      join(fixture, "next.config.mjs"),
      "export default {experimental:{cpus:2}};",
    );
    await writeFile(
      join(fixture, "app/layout.jsx"),
      `import '@abuzareal/contour-ui/${aggregate}.css';export default function Layout({children}){return <html lang="en"><body>{children}</body></html>}`,
    );
    for (const [name, source] of Object.entries(sizeFixtures).filter(
      ([name]) => name !== "button-icons",
    )) {
      await mkdir(join(fixture, "app", name), { recursive: true });
      await writeFile(
        join(fixture, "app", name, "page.jsx"),
        `'use client';\n${source}`,
      );
    }
    execFileSync(
      process.execPath,
      [join(fixture, "node_modules/next/dist/bin/next"), "build", "--webpack"],
      {
        cwd: fixture,
        stdio: "inherit",
        env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      },
    );
    server = spawn(
      process.execPath,
      [
        join(fixture, "node_modules/next/dist/bin/next"),
        "start",
        "--hostname",
        "127.0.0.1",
        "--port",
        "0",
      ],
      {
        cwd: fixture,
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      },
    );
    const origin = await new Promise((accept, reject) => {
      let message = "";
      const timer = setTimeout(
        () => reject(new Error("Next server did not start")),
        30000,
      );
      server.once("exit", (code) => {
        clearTimeout(timer);
        reject(new Error("Next exited " + code));
      });
      const capture = (chunk) => {
        message += chunk;
        const match = message.match(/http:\/\/127\.0\.0\.1:\d+/);
        if (match && message.includes("Ready")) {
          clearTimeout(timer);
          accept(match[0]);
        }
      };
      server.stdout.on("data", capture);
      server.stderr.on("data", capture);
    });
    for (const name of Object.keys(sizeFixtures).filter(
      (name) => name !== "button-icons",
    ))
      report.next[name] = await inspectPage(origin, "/" + name, fixture, name);
    const routes = Object.values(report.next);
    report.nextShared = {
      jsFiles: routes[0].files
        .filter(
          (f) =>
            f.category === "js" &&
            routes.every((route) =>
              route.files.some((other) => other.path === f.path),
            ),
        )
        .map((f) => f.path),
      definition:
        "Intersection of JS URLs actually requested by all measured fresh routes; not an estimate of library-only cost",
    };
    for (const route of routes)
      route.routeSpecificJs = route.files
        .filter(
          (f) =>
            f.category === "js" && !report.nextShared.jsFiles.includes(f.path),
        )
        .map((f) => f.path);
  }
  await closeServer();
  const vector = {};
  for (const [framework, cases] of Object.entries({
    vite: report.vite,
    next: report.next,
  }))
    for (const [name, result] of Object.entries(cases)) {
      vector[framework + "/" + name] = {
        jsRawBytes: result.files
          .filter((f) => f.category === "js")
          .reduce((sum, f) => sum + f.bytes, 0),
        cssRawBytes: result.files
          .filter((f) => f.category === "css")
          .reduce((sum, f) => sum + f.bytes, 0),
        fontRequests: result.files.filter((f) => f.category === "fonts").length,
      };
      assert.equal(
        vector[framework + "/" + name].fontRequests,
        0,
        "system-font first use makes no font requests",
      );
    }
  report.budgetVector = vector;
  if (
    process.env.CONTOUR_WRITE_SIZE_BASELINE === "1" ||
    process.argv.includes("--write-baseline")
  )
    await writeFile(
      "scripts/size-baseline.json",
      JSON.stringify(
        {
          metadata: report.metadata,
          policy:
            "Baseline production raw fetched JS/CSS totals. Gate allows 10 percent plus 1024 bytes for chunk/minifier drift; review deliberate growth. Gzip values stay per-file. Exact tool and package versions recorded.",
          baseline: vector,
          budgets: Object.fromEntries(
            Object.entries(vector).map(([name, value]) => [
              name,
              {
                jsRawBytes: Math.ceil(value.jsRawBytes * 1.1) + 1024,
                cssRawBytes: Math.ceil(value.cssRawBytes * 1.1) + 1024,
                fontRequests: 0,
              },
            ]),
          ),
        },
        null,
        2,
      ) + "\n",
    );
  else if (
    process.env.CONTOUR_SIZE_CHECK === "1" ||
    process.argv.includes("--check")
  ) {
    const budgets = JSON.parse(
      await readFile("scripts/size-baseline.json", "utf8"),
    ).budgets;
    for (const [name, value] of Object.entries(vector))
      for (const metric of Object.keys(value))
        assert.ok(
          value[metric] <= budgets[name][metric],
          `${name} ${metric} ${value[metric]} exceeds ${budgets[name][metric]}`,
        );
  }
  await mkdir(resolve(output, ".."), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
  console.log("Size measurements saved to " + output);
  console.log(JSON.stringify(vector, null, 2));
} finally {
  await browser?.close();
  await closeServer();
  await rm(temporary, { recursive: true, force: true });
}

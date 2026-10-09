import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build, preview } from "vite";
import { chromium } from "@playwright/test";

test("3D initialization rolls back owned resources and paused scenes reflow on resize", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "contour-stage-"));
  let server, browser;
  try {
    await writeFile(
      join(temporary, "index.html"),
      '<style>.stage-canvas{width:100%;height:100%}</style><div id="root"></div><script type="module" src="/main.js"></script>',
    );
    await writeFile(
      join(temporary, "three-instrumented.js"),
      `
export * from ${JSON.stringify(resolve("node_modules/three/build/three.module.js"))};
import { WebGLRenderer as RealRenderer } from ${JSON.stringify(resolve("node_modules/three/build/three.module.js"))};
export class WebGLRenderer extends RealRenderer {
 constructor(...args) {
  super(...args);
  const release = this.dispose;
  this.dispose = () => { window.counts.renderer++; release.call(this); };
  const render = this.render;
  this.render = (scene, camera) => {
   window.counts.renders++;
   const group = scene.children.find(child => child.isGroup && child.children.length === 4);
   if (group) window.positions = group.children.map(child => [child.position.x, child.position.y]);
   return render.call(this, scene, camera);
  };
 }
}`,
    );
    await writeFile(
      join(temporary, "main.js"),
      `
import React from ${JSON.stringify(resolve("node_modules/react/index.js"))};
import { createRoot } from ${JSON.stringify(resolve("node_modules/react-dom/client.js"))};
import * as THREE from "three";
import { RoomEnvironment } from ${JSON.stringify(resolve("node_modules/three/examples/jsm/environments/RoomEnvironment.js"))};
import { useThreeStage, ObjectStudy } from ${JSON.stringify(resolve("dist/three.js"))};
const scenario = new URLSearchParams(location.search).get('scenario');
window.counts = { renderer: 0, environment: 0, generator: 0, owned: 0, stage: 0, renders: 0 };
for (const [type, key] of [[RoomEnvironment, 'environment'], [THREE.PMREMGenerator, 'generator']]) {
 const original = type.prototype.dispose;
 type.prototype.dispose = function(...args) { window.counts[key]++; return original.apply(this, args); };
}
if (scenario === 'environment') THREE.PMREMGenerator.prototype.fromScene = () => { throw Error('environment fixture'); };
if (scenario === 'observer') window.ResizeObserver = class { constructor() { throw Error('observer fixture'); } };
function Stage() {
 const ref = React.useRef(null);
 useThreeStage(ref, { motionEnabled: false, cameraDistance: () => 10, setup: ({ onDispose }) => {
  onDispose(() => { window.counts.owned++; });
  if (scenario === 'setup') throw Error('setup fixture');
  return { update() {}, rest() {}, dispose() { window.counts.stage++; } };
 } });
 return React.createElement('div', { ref, style: { height: 300 }, id: 'stage' });
}
function App() {
 const [mounted, setMounted] = React.useState(true);
 return React.createElement(React.Fragment, null, React.createElement('button', { onClick: () => setMounted(false) }, 'Unmount'), mounted && React.createElement('div', { style: { width: '100%', maxWidth: 900, height: 400 } }, scenario === 'layout' ? React.createElement(ObjectStudy, { study: 'geometry', motionEnabled: false, label: 'Study' }) : React.createElement(Stage)));
}
createRoot(document.getElementById('root')).render(React.createElement(App));
`,
    );
    // The fixture imports absolute React/Three entries; package imports resolve to the same instances.
    await build({
      root: temporary,
      configFile: false,
      logLevel: "warn",
      resolve: {
        alias: [
          {
            find: /^three$/,
            replacement: join(temporary, "three-instrumented.js"),
          },
        ],
      },
    });
    server = await preview({
      root: temporary,
      configFile: false,
      preview: { host: "127.0.0.1", port: 0 },
    });
    browser = await chromium.launch({
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    });
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    for (const scenario of ["environment", "setup", "observer"]) {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${origin}/?scenario=${scenario}`);
      await page.locator('[data-state="unavailable"]').waitFor();
      assert.equal(await page.locator("canvas").count(), 0);
      const counts = await page.evaluate(() => window.counts);
      assert.equal(counts.renderer, 1, scenario);
      assert.equal(counts.environment, 1, scenario);
      assert.equal(counts.generator, 1, scenario);
      assert.equal(counts.owned, scenario === "environment" ? 0 : 1, scenario);
      assert.equal(counts.stage, scenario === "observer" ? 1 : 0, scenario);
      assert.deepEqual(errors, []);
      await page.close();
    }
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await page.goto(`${origin}/?scenario=layout`);
    await page.waitForFunction(() => window.positions?.length === 4);
    assert.equal(
      await page.evaluate(
        () => new Set(window.positions.map((position) => position[1])).size,
      ),
      1,
    );
    await page.setViewportSize({ width: 390, height: 800 });
    await page.waitForFunction(
      () => new Set(window.positions.map((position) => position[1])).size === 2,
    );
    const renders = await page.evaluate(() => window.counts.renders);
    await page.waitForTimeout(200);
    assert.equal(
      await page.evaluate(() => window.counts.renders),
      renders,
      "paused scene does not run a continuous loop",
    );
    await page.getByRole("button", { name: "Unmount" }).click();
    assert.equal(await page.locator("canvas").count(), 0);
    assert.equal(await page.evaluate(() => window.counts.renderer), 1);
  } finally {
    await browser?.close();
    await server?.httpServer.close();
    await rm(temporary, { recursive: true, force: true });
  }
});

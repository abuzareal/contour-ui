import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build, preview } from "vite";
import { chromium, expect } from "@playwright/test";
test("nested portals, native modal top layer, collision, pointer corridor, scopes, RTL and viewport changes", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "contour-over-browser-"));
  let server, browser;
  try {
    await writeFile(
      join(temporary, "index.html"),
      '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script type="module" src="/main.jsx"></script></body></html>',
    );
    await writeFile(
      join(temporary, "foreign.css"),
      `body {margin:0;font-family:Georgia;color:rgb(80,0,90);--acid:red;--surface:orange}.button{background:red;color:white}.card{border:9px solid red}.tabs{background:blue}.menu{color:red}.mono{font-family:Georgia}.foreign {padding:8px} .contour-root{padding:20px} .clip{overflow:hidden;height:90px;width:100%;border:1px solid gray} .edge{position:fixed;inset-inline-end:2px;bottom:4px} .scopes{display:flex;gap:12px;flex-wrap:wrap} .scopes>.contour-root{flex:1;min-width:150px} .specimens{display:grid;gap:16px;max-width:620px}`,
    );
    await writeFile(
      join(temporary, "main.jsx"),
      `
import React,{useState,useRef} from ${JSON.stringify(resolve("node_modules/react/index.js"))};
import {createRoot} from ${JSON.stringify(resolve("node_modules/react-dom/client.js"))};
import {Button,Card,TextField,Switch,Checkbox,Slider,RadioGroup,Tabs,Popover,DropdownMenu,Dialog,Tooltip,ThemeScope,ThemeToggle,Tag,Pagination,Reveal,RevealHeading,Disclosure,Marquee,Avatar,DepthButton,Alert} from ${JSON.stringify(resolve("dist/index.js"))};
import './foreign.css';
import ${JSON.stringify(resolve("dist/scoped.css"))};
import ${JSON.stringify(resolve("dist/fonts-latin.css"))};
const query=new URLSearchParams(location.search), initial=query.get('theme')||'light', direction=query.get('dir')||'ltr';
function App(){
 const [theme,setTheme]=useState(initial),[modal,setModal]=useState(false),[removed,setRemoved]=useState(false),[page,setPage]=useState(1);
 const first=useRef(null),modalInitial=useRef(null);
 return <><div className="foreign"><button className="button" id="foreign">Foreign action</button><section id="foreign-section">Foreign section</section></div>
 <ThemeScope theme={theme} onThemeChange={setTheme} dir={direction} id="scope"><div className="specimens">
 <Reveal className="fixture-reveal"><RevealHeading id="revealed" lines={[{text:"Revealed heading"}]}/></Reveal><Disclosure className="fixture-disclosure" summary="Disclosure summary">Disclosure details</Disclosure><Marquee items={["First","Second"]} label="Ticker"/><ThemeToggle animate={false}/><h1>Contour specimens</h1><Button variant="accent">Accent action</Button><Card title="Paper and ink">Surface content</Card>
 <TextField label="Full name" defaultValue="Ada"/><TextField label="Invalid name" error="Enter a name"/><Checkbox label="Accept" defaultChecked/><Switch label="Updates" defaultChecked/><Slider label="Amount" defaultValue={42}/><RadioGroup label="Plan" options={[{value:'a',label:'Basic'},{value:'b',label:'Plus'}]} defaultValue="a"/>
 <Tabs label="Views" tabs={[{id:'one',label:'One',content:'First panel'},{id:'two',label:'Two',content:'Second panel'}]}/>
 <Tag removeLabel="Eliminar" onRemove={()=>{}}>Label</Tag><Pagination page={page} pageCount={3} onChange={setPage} previousLabel="Anterior" nextLabel="Siguiente" pageLabel={n=>'Página '+n}/>
 <div className="clip"><Popover trigger="Clipped trigger" title="Outside clipping" initialFocus={direction==='rtl'?first:undefined} renderTrigger={props=><Button {...props} variant="secondary"/>}>
   <TextField ref={first} label="Panel input"/><Popover trigger="Nested trigger" title="Nested panel"><Button>Nested action</Button></Popover><Button>Parent action</Button>
 </Popover></div>
 <Popover trigger="Sibling first" title="Sibling first panel" onDismiss={(reason,event)=>{if(reason==='outside')event.preventDefault()}}><Button>First sibling action</Button></Popover><Popover trigger="Sibling second" title="Sibling second panel" onDismiss={(reason,event)=>{if(reason==='outside')event.preventDefault()}}><Button>Second sibling action</Button></Popover>
 <Tooltip content="Supplemental hint"><Button id="hint" aria-describedby="extra">Hint trigger</Button></Tooltip><span id="extra">Existing description</span>
 <DropdownMenu label="Actions" renderTrigger={props=><Button {...props}/>} items={[{id:'a',label:'Alpha',onSelect(){}},{id:'b',label:'Beta',onSelect(){}}]}/><Button id="outside">Outside focus</Button>
 <Button onClick={()=>setModal(true)}>Open modal</Button>
 <Dialog open={modal} onClose={()=>setModal(false)} title="Native modal" initialFocus={modalInitial}>
  <TextField ref={modalInitial} label="Modal initial"/><Popover defaultOpen trigger="Auto modal trigger" title="Auto modal panel"><Button>Automatic panel action</Button></Popover>
  <Popover trigger="Modal popover" title="Modal child"><TextField label="Modal field"/><DropdownMenu label="Modal actions" items={[{label:'Modal item',onSelect(){}}]}/></Popover>
 </Dialog>
 {!removed&&<div className="edge"><Popover trigger="Edge trigger" title="Long content" align="end"><div style={{height:1400}}>Long text</div><Button onClick={()=>setRemoved(true)}>Unmount layer</Button></Popover></div>}
 </div></ThemeScope><div className="scopes"><ThemeScope theme="light"><Button id="light">Light surface</Button><Avatar name="Ada"/><DepthButton>Light depth</DepthButton><Alert layout="banner" title="Light banner">Banner</Alert></ThemeScope><ThemeScope theme="dark"><Button id="dark">Dark surface</Button><Avatar name="Ada"/><DepthButton>Dark depth</DepthButton><Alert layout="banner" title="Dark banner">Banner</Alert></ThemeScope></div></>;
}createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
`,
    );
    await build({
      root: temporary,
      configFile: false,
      logLevel: "warn",
      resolve: {
        alias: {
          "react/jsx-runtime": resolve("node_modules/react/jsx-runtime.js"),
        },
      },
    });
    server = await preview({
      root: temporary,
      configFile: false,
      preview: { host: "127.0.0.1", port: 0 },
    });
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    browser = await chromium.launch();
    for (const theme of ["light", "dark"])
      for (const dir of ["ltr", "rtl"]) {
        const page = await browser.newPage({
          viewport: { width: 390, height: 740 },
          reducedMotion: "reduce",
          hasTouch: true,
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(origin + "/?theme=" + theme + "&dir=" + dir);
        await expect(
          page.getByRole("button", { name: "Clipped trigger" }),
        ).toBeVisible();
        assert.equal(
          await page
            .locator("#foreign")
            .evaluate((e) => getComputedStyle(e).backgroundColor),
          "rgb(255, 0, 0)",
        );
        assert.equal(
          await page
            .locator(".contour-tabs")
            .evaluate((e) => getComputedStyle(e).backgroundColor),
          "rgba(0, 0, 0, 0)",
        );
        assert.equal(
          await page
            .locator(".contour-card")
            .evaluate((e) => getComputedStyle(e).borderTopWidth),
          "1px",
        );
        assert.equal(
          await page
            .locator("#foreign-section")
            .evaluate((e) => getComputedStyle(e).scrollMarginTop),
          "0px",
        );
        assert.equal(
          await page
            .locator("#light")
            .evaluate((e) => getComputedStyle(e).backgroundColor),
          "rgb(23, 24, 23)",
        );
        assert.equal(
          await page
            .locator("#dark")
            .evaluate((e) => getComputedStyle(e).backgroundColor),
          "rgb(242, 243, 238)",
        );
        assert.equal(
          await page
            .getByRole("switch", { name: "Updates" })
            .evaluate((track) => {
              const thumb = track.querySelector(".contour-switch-thumb");
              const a = track.getBoundingClientRect(),
                b = thumb.getBoundingClientRect();
              return b.left >= a.left && b.right <= a.right;
            }),
          true,
          "checked switch thumb stays inside its track in either direction",
        );
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.locator(".contour-reveal").scrollIntoViewIfNeeded();
        await expect(page.locator(".contour-reveal")).toHaveCSS("opacity", "1");
        await expect(page.locator(".contour-type-run")).toHaveCSS(
          "opacity",
          "1",
        );
        await expect(page.locator(".contour-disclosure")).toBeVisible();
        await page.getByText("Disclosure summary", { exact: true }).click();
        await expect(page.locator(".contour-disclosure")).toHaveAttribute(
          "open",
          "",
        );
        assert.equal(
          await page
            .locator(".contour-marquee")
            .evaluate((e) => getComputedStyle(e).backgroundColor),
          theme === "light" ? "rgb(23, 24, 23)" : "rgb(242, 243, 238)",
        );
        await page.emulateMedia({ reducedMotion: "reduce" });
        assert.equal(
          await page
            .locator(
              '.scopes [data-contour-theme="light"] .contour-avatar-initials',
            )
            .evaluate((e) => getComputedStyle(e).color),
          "rgb(208, 243, 68)",
        );
        assert.equal(
          await page
            .locator(
              '.scopes [data-contour-theme="dark"] .contour-avatar-initials',
            )
            .evaluate((e) => getComputedStyle(e).color),
          "rgb(23, 24, 23)",
        );
        assert.equal(
          await page
            .getByRole("button", { name: "Dark depth" })
            .evaluate((e) => getComputedStyle(e).backgroundColor),
          "rgb(90, 114, 16)",
        );
        assert.equal(
          await page
            .locator(
              '.scopes [data-contour-theme="dark"] .contour-alert-banner',
            )
            .evaluate((e) =>
              getComputedStyle(e)
                .getPropertyValue("--contour-alert-accent")
                .trim(),
            ),
          "#5a7210",
        );
        const tab = page.getByRole("tab", { name: "One" });
        await tab.focus();
        await page.keyboard.press(dir === "rtl" ? "ArrowLeft" : "ArrowRight");
        await expect(page.getByRole("tab", { name: "Two" })).toBeFocused();
        await page.getByRole("button", { name: "Clipped trigger" }).click();
        const parent = page.getByRole("dialog", {
          name: "Outside clipping",
          exact: true,
        });
        await expect(parent).toBeVisible();
        if (dir === "rtl")
          await expect(
            page.getByRole("textbox", { name: "Panel input" }),
          ).toBeFocused();
        else await expect(parent).toBeFocused();
        assert.equal(
          await parent.evaluate((e) => e.closest(".clip") === null),
          true,
        );
        await page.getByRole("button", { name: "Nested trigger" }).click();
        const child = page.getByRole("dialog", {
          name: "Nested panel",
          exact: true,
        });
        await expect(child).toBeVisible();
        await page.getByRole("button", { name: "Nested action" }).click();
        await expect(parent).toBeVisible();
        await expect(child).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(child).toBeHidden();
        await expect(parent).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Nested trigger" }),
        ).toBeFocused();
        // Programmatic scroll must not hover an unrelated tooltip under the old pointer.
        // A tooltip is itself a dismissal layer; the outside-press assertion targets the popover.
        await page.mouse.move(0, 0);
        await page
          .getByRole("button", { name: "Outside focus" })
          .scrollIntoViewIfNeeded();
        await page.getByRole("button", { name: "Outside focus" }).click();
        await expect(parent)
          .toBeHidden()
          .catch(async (error) => {
            console.error(
              "Visible layer diagnostics",
              await page
                .locator(
                  ".contour-popover-panel,.contour-tooltip,.contour-menu-list",
                )
                .evaluateAll((nodes) =>
                  nodes
                    .filter(
                      (e) =>
                        getComputedStyle(e).visibility !== "hidden" &&
                        !e.hidden,
                    )
                    .map((e) => ({
                      className: e.className,
                      content: e.textContent?.slice(0, 120),
                      zIndex: getComputedStyle(e).zIndex,
                      bounds: e.getBoundingClientRect().toJSON(),
                    })),
                ),
            );
            throw error;
          });
        await expect(page.locator("#outside")).toBeFocused();
        await page
          .getByRole("button", { name: "Sibling second", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Sibling first", exact: true })
          .click();
        const siblingFirst = page.getByRole("dialog", {
            name: "Sibling first panel",
          }),
          siblingSecond = page.getByRole("dialog", {
            name: "Sibling second panel",
          });
        assert.ok(
          (await siblingFirst.evaluate((e) =>
            Number(getComputedStyle(e).zIndex),
          )) >
            (await siblingSecond.evaluate((e) =>
              Number(getComputedStyle(e).zIndex),
            )),
        );
        await page.keyboard.press("Escape");
        await expect(siblingFirst).toBeHidden();
        await expect(siblingSecond).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(siblingSecond).toBeHidden();
        const hint = page.locator("#hint");
        await hint.hover();
        const tip = page.getByRole("tooltip", { includeHidden: true });
        await expect(tip).toHaveCSS("visibility", "visible");
        const a = await hint.boundingBox(),
          b = await tip.boundingBox();
        await page.mouse.move(a.x + a.width / 2, a.y - 3);
        await page.waitForTimeout(220);
        await expect(tip).toHaveCSS("visibility", "visible");
        await tip.hover();
        await page.waitForTimeout(220);
        await expect(tip).toHaveCSS("visibility", "visible");
        await page.keyboard.press("Escape");
        await expect(tip).toHaveCSS("visibility", "hidden");
        assert.ok(
          (await hint.getAttribute("aria-describedby")).startsWith("extra "),
        );
        await page.getByRole("button", { name: "Open modal" }).click();
        await expect(
          page.getByRole("textbox", { name: "Modal initial" }),
        ).toBeFocused();
        const automatic = page.getByRole("dialog", {
          name: "Auto modal panel",
          exact: true,
        });
        await expect(automatic).toBeVisible();
        assert.equal(
          await automatic.evaluate((e) => !!e.closest("dialog[open]")),
          true,
          "default-open floating content enters the native modal top layer on the same commit",
        );
        await page.keyboard.press("Escape");
        await expect(automatic).toBeHidden();
        await page.getByRole("button", { name: "Modal popover" }).click();
        const modalChild = page.getByRole("dialog", {
          name: "Modal child",
          exact: true,
        });
        await expect(modalChild).toBeVisible();
        assert.equal(
          await modalChild.evaluate((e) => !!e.closest("dialog[open]")),
          true,
        );
        await page
          .getByRole("textbox", { name: "Modal field" })
          .fill("Inside modal");
        await page.getByRole("button", { name: "Modal actions" }).click();
        await page.keyboard.press("Escape");
        await expect(modalChild).toBeVisible();
        await expect(
          page.getByRole("dialog", { name: "Native modal", exact: true }),
        ).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(modalChild).toBeHidden();
        await page.getByRole("button", { name: "Modal popover" }).click();
        await page.mouse.click(2, 2);
        await expect(modalChild).toBeHidden();
        await expect(
          page.getByRole("dialog", { name: "Native modal", exact: true }),
        ).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(
          page.getByRole("dialog", { name: "Native modal", exact: true }),
        ).toBeHidden();
        await page.getByRole("button", { name: "Edge trigger" }).tap();
        const long = page.getByRole("dialog", {
          name: "Long content",
          exact: true,
        });
        await expect(long).toBeVisible();
        await expect
          .poll(() =>
            long.evaluate((e) => {
              const r = e.getBoundingClientRect();
              return (
                r.left >= -1 &&
                r.right <= innerWidth + 1 &&
                r.top >= -1 &&
                r.bottom <= innerHeight + 1
              );
            }),
          )
          .toBe(true);
        await page.setViewportSize({ width: 320, height: 360 });
        await expect
          .poll(() =>
            long.evaluate((e) => {
              const r = e.getBoundingClientRect();
              return (
                r.left >= -1 &&
                r.right <= innerWidth + 1 &&
                r.top >= -1 &&
                r.bottom <= innerHeight + 1
              );
            }),
          )
          .toBe(true);
        await long
          .getByRole("button", { name: "Unmount layer" })
          .scrollIntoViewIfNeeded();
        await long.getByRole("button", { name: "Unmount layer" }).click();
        await page.keyboard.press("Escape");
        await page.setViewportSize({ width: 390, height: 740 });
        await page.evaluate(() => scrollTo(0, 0));
        if (process.env.CONTOUR_VISUAL_DIR) {
          await mkdir(process.env.CONTOUR_VISUAL_DIR, { recursive: true });
          await page.screenshot({
            path: join(
              process.env.CONTOUR_VISUAL_DIR,
              `scoped-${theme}-${dir}-390.png`,
            ),
            fullPage: true,
          });
        }
        await page.evaluate(() => (document.body.style.zoom = "2"));
        await page.getByRole("button", { name: "Clipped trigger" }).click();
        await expect(parent).toBeVisible();
        await expect
          .poll(() =>
            parent.evaluate((e) => {
              const r = e.getBoundingClientRect();
              return (
                r.left >= -1 &&
                r.right <= innerWidth + 1 &&
                r.top >= -1 &&
                r.bottom <= innerHeight + 1
              );
            }),
          )
          .toBe(true);
        await page.keyboard.press("Escape");
        await page.evaluate(() => (document.body.style.zoom = ""));
        await page.emulateMedia({ forcedColors: "active" });
        await page.getByRole("button", { name: "Accent action" }).focus();
        assert.notEqual(
          await page
            .getByRole("button", { name: "Accent action" })
            .evaluate((e) => getComputedStyle(e).outlineStyle),
          "none",
        );
        assert.equal(
          await page
            .locator(".contour-field-control")
            .filter({
              has: page.getByRole("textbox", { name: "Invalid name" }),
            })
            .evaluate((e) => getComputedStyle(e).borderBottomStyle),
          "dashed",
        );
        if (process.env.CONTOUR_VISUAL_DIR)
          await page.screenshot({
            path: join(
              process.env.CONTOUR_VISUAL_DIR,
              `forced-${theme}-${dir}-390.png`,
            ),
            fullPage: true,
          });
        assert.deepEqual(errors, []);
        await page.close();
      }
  } finally {
    await browser?.close();
    if (server)
      await new Promise((resolve) => server.httpServer.close(resolve));
    await rm(temporary, { recursive: true, force: true });
  }
});

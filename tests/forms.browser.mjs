import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build, preview } from "vite";
import { chromium, expect } from "@playwright/test";

test("native FormData, form owners, range sanitization, validation and resets work in a browser", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "contour-forms-"));
  let browser, server;
  try {
    await writeFile(
      join(temporary, "index.html"),
      '<html lang="en"><head><link rel="icon" href="/favicon.svg"></head><div id="root"></div><script type="module" src="/main.js"></script></html>',
    );
    await writeFile(
      join(temporary, "favicon.svg"),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"/></svg>',
    );
    await writeFile(
      join(temporary, "main.js"),
      `
import React,{useState} from ${JSON.stringify(resolve("node_modules/react/index.js"))};
import {createRoot} from ${JSON.stringify(resolve("node_modules/react-dom/client.js"))};
import {Switch,Slider,RadioGroup,Checkbox,TextField,TextArea,SelectField,Button} from ${JSON.stringify(resolve("dist/index.js"))};
import ${JSON.stringify(resolve("dist/reset.css"))};
import ${JSON.stringify(resolve("dist/styles.css"))};
const h=React.createElement;const options=[{value:'email',label:'Email contact'},{value:'phone',label:'Phone contact'},{value:'disabled',label:'Disabled contact',disabled:true}];
function Controls({form,disabled=false}) {return h(React.Fragment,null,h(Switch,{name:'updates',label:'Updates',defaultChecked:true,form}),h(Slider,{name:'level',label:'Level',defaultValue:20,format:n=>n+'%',form}),h(RadioGroup,{name:'contact',legend:'Contact',options,defaultValue:'email',form,disabled}));}
function App(){const [owner,setOwner]=useState('external-one'),[disabled,setDisabled]=useState(false),[controlled,setControlled]=useState({checked:true,level:70,contact:'phone'});return h('main',{style:{padding:16,maxWidth:600}},
 h('h1',null,'Native form contracts'),
 h('form',{id:'native',onSubmit:e=>e.preventDefault()},h('fieldset',{disabled},h(Controls,{}),h(TextField,{name:'text',label:'Name',defaultValue:'abc',maxLength:20}),h(TextArea,{name:'notes',label:'Notes',defaultValue:'abc',maxLength:20,autoResize:true}),h(SelectField,{name:'pick',label:'Pick',defaultValue:'one',options:[{value:'one',label:'One'},{value:'two',label:'Two'}]}),h(Checkbox,{name:'accept',label:'Accept',id:'accept',defaultChecked:true})),h(Button,{type:'reset'},'Reset native')),
 h(Button,{onClick:()=>setDisabled(!disabled)},'Toggle disabled fieldset'),
 h('form',{id:'external-one'}),h('form',{id:'external-two'}),h('section',{'aria-label':'External controls'},h(Controls,{form:owner})),h(Button,{onClick:()=>setOwner('external-two')},'Change owner'),
 h('form',{id:'controlled'},h(Switch,{name:'updates',label:'Controlled updates',checked:controlled.checked,onChange:()=>{}}),h(Slider,{name:'level',label:'Controlled level',value:controlled.level,onChange:()=>{}}),h(RadioGroup,{name:'contact',legend:'Controlled contact',options,value:controlled.contact,onChange:()=>{}}),h(TextField,{name:'text',label:'Controlled name',value:controlled.checked?'parent':'default',onChange(){},maxLength:20}),h(TextArea,{name:'notes',label:'Controlled notes',value:controlled.checked?'parent notes':'reset',onChange(){},maxLength:20,autoResize:true}),h(SelectField,{name:'pick',label:'Controlled pick',value:controlled.contact,onChange(){},options:[{value:'email',label:'Email'},{value:'phone',label:'Phone'}]}),h(Checkbox,{name:'accept',label:'Controlled accept',checked:controlled.checked,onChange(){}}),h(Button,{type:'reset'},'Reset controlled')),
 h(Button,{onClick:()=>setControlled({checked:false,level:10,contact:'email'})},'Parent reset values'),
 h('form',{id:'validation',onSubmit:e=>e.preventDefault()},h(Switch,{name:'consent',label:'Consent',required:true}),h(Button,{type:'submit'},'Validate consent')),
 h('form',{id:'radio-validation',onSubmit:e=>e.preventDefault()},h(RadioGroup,{name:'method',legend:'Required contact',options,required:true}),h(Button,{type:'submit'},'Validate contact')),
 h(Slider,{name:'clamped',label:'Clamped level',defaultValue:999,min:0,max:10,step:2,format:n=>n+' units'}));}
createRoot(document.getElementById('root')).render(h(App));`,
    );
    await build({ root: temporary, configFile: false, logLevel: "warn" });
    server = await preview({
      root: temporary,
      configFile: false,
      preview: { host: "127.0.0.1", port: 0 },
    });
    browser = await chromium.launch({ channel: "chromium" });
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}`);
    const data = (id) =>
      page.evaluate(
        (id) => [...new FormData(document.getElementById(id)).entries()],
        id,
      );
    const choices = [
      ["updates", "on"],
      ["level", "20"],
      ["contact", "email"],
    ];
    const initial = [
      ...choices,
      ["text", "abc"],
      ["notes", "abc"],
      ["pick", "one"],
      ["accept", "on"],
    ];
    assert.deepEqual(await data("native"), initial);
    const native = page.locator("#native");
    await native.getByRole("switch").click();
    await native.getByRole("slider").focus();
    await page.keyboard.press("ArrowRight");
    await native
      .getByRole("radio", { name: "Phone contact", exact: true })
      .check();
    await native
      .getByRole("textbox", { name: "Name", exact: true })
      .fill("abcdef");
    await native
      .getByRole("textbox", { name: "Notes", exact: true })
      .fill("a\nb\nc\nd\ne\nf\ng");
    await native.getByRole("combobox").selectOption("two");
    await native
      .getByRole("checkbox", { name: "Accept", exact: true })
      .uncheck();
    assert.deepEqual(await data("native"), [
      ["level", "21"],
      ["contact", "phone"],
      ["text", "abcdef"],
      ["notes", "a\nb\nc\nd\ne\nf\ng"],
      ["pick", "two"],
    ]);
    await page.evaluate(() =>
      document
        .getElementById("native")
        .addEventListener("reset", (event) => event.preventDefault(), {
          once: true,
        }),
    );
    await page
      .getByRole("button", { name: "Reset native", exact: true })
      .click();
    assert.equal(await native.getByRole("slider").inputValue(), "21");
    await expect(native.getByText("21%", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Reset native", exact: true })
      .click();
    await expect(native.getByRole("switch")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(native.getByRole("slider")).toHaveValue("20");
    assert.deepEqual(await data("native"), initial);
    await expect(native.getByText("3/20", { exact: true })).toHaveCount(2);
    await page
      .getByRole("button", { name: "Toggle disabled fieldset", exact: true })
      .click();
    assert.deepEqual(await data("native"), []);
    await page
      .getByRole("button", { name: "Toggle disabled fieldset", exact: true })
      .click();
    assert.deepEqual(await data("external-one"), choices);
    const external = page.getByRole("region", { name: "External controls" });
    await external.getByRole("switch").click();
    await external.getByRole("slider").focus();
    await page.keyboard.press("ArrowRight");
    await external
      .getByRole("radio", { name: "Phone contact", exact: true })
      .check();
    await page
      .getByRole("button", { name: "Change owner", exact: true })
      .click();
    assert.deepEqual(await data("external-one"), []);
    assert.deepEqual(await data("external-two"), [
      ["level", "21"],
      ["contact", "phone"],
    ]);
    await page.evaluate(() => document.getElementById("external-one").reset());
    assert.equal(await external.getByRole("slider").inputValue(), "21");
    await page.evaluate(() => document.getElementById("external-two").reset());
    await expect(external.getByRole("switch")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(external.getByRole("slider")).toHaveValue("20");
    assert.deepEqual(await data("external-two"), choices);
    const controlled = page.locator("#controlled");
    await controlled.getByRole("switch").click();
    await page
      .getByRole("button", { name: "Reset controlled", exact: true })
      .click();
    await expect(controlled.getByRole("switch")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(controlled.getByRole("slider")).toHaveValue("70");
    await expect
      .poll(() => data("controlled"))
      .toEqual([
        ["updates", "on"],
        ["level", "70"],
        ["contact", "phone"],
        ["text", "parent"],
        ["notes", "parent notes"],
        ["pick", "phone"],
        ["accept", "on"],
      ]);
    await page
      .getByRole("button", { name: "Parent reset values", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Reset controlled", exact: true })
      .click();
    await expect(controlled.getByRole("slider")).toHaveValue("10");
    await expect
      .poll(() => data("controlled"))
      .toEqual([
        ["level", "10"],
        ["contact", "email"],
        ["text", "default"],
        ["notes", "reset"],
        ["pick", "email"],
      ]);
    await page
      .getByRole("button", { name: "Validate consent", exact: true })
      .click();
    const consent = page.getByRole("switch", { name: "Consent", exact: true });
    await expect(consent).toBeFocused();
    await expect(consent).toHaveAttribute("aria-invalid", "true");
    await expect(
      page.getByText("Turn on this option to continue.", { exact: true }),
    ).toBeVisible();
    assert.equal(
      await page
        .locator("#validation")
        .evaluate((form) => form.checkValidity()),
      false,
    );
    await consent.click();
    assert.equal(
      await page
        .locator("#validation")
        .evaluate((form) => form.checkValidity()),
      true,
    );
    assert.deepEqual(await data("validation"), [["consent", "on"]]);
    await page
      .getByRole("button", { name: "Validate contact", exact: true })
      .click();
    await expect(
      page
        .locator("#radio-validation")
        .getByRole("radio", { name: "Email contact", exact: true }),
    ).toBeFocused();
    const clamped = page.getByRole("slider", {
      name: "Clamped level",
      exact: true,
    });
    await expect(clamped).toHaveValue("10");
    await expect(clamped).toHaveAttribute("aria-valuetext", "10 units");
    for (const theme of ["light", "dark"]) {
      await page
        .locator("html")
        .evaluate((el, theme) => (el.dataset.theme = theme), theme);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
    await server?.close();
    await rm(temporary, { recursive: true, force: true });
  }
});

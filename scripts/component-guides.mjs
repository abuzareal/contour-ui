import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const detailFields = [
  "use",
  "anatomy",
  "state",
  "forms",
  "ref",
  "styling",
  "edgeCases",
  "localization",
  "reference",
];
export async function loadComponentGuides() {
  const data = JSON.parse(await readFile("docs/component-guides.json", "utf8"));
  assert.equal(data.schemaVersion, 1);
  assert.ok(Array.isArray(data.components) && Array.isArray(data.families));
  const names = new Set(),
    slugs = new Set(),
    families = new Map();
  for (const family of data.families) {
    assert.match(family.id, /^[a-z][a-z-]*$/);
    assert.match(family.example, /^examples\/catalogue\/[a-z-]+\.tsx$/);
    assert.ok(!families.has(family.id), `Duplicate family ${family.id}`);
    await access(family.example);
    families.set(family.id, family);
  }
  for (const guide of data.components) {
    assert.match(guide.name, /^[A-Z][A-Za-z]+$/);
    assert.match(guide.slug, /^[a-z][a-z-]*$/);
    assert.ok(
      !names.has(guide.name) && !slugs.has(guide.slug),
      `Duplicate guide ${guide.name}`,
    );
    names.add(guide.name);
    slugs.add(guide.slug);
    assert.ok(
      families.has(guide.family),
      `Missing example family ${guide.name}`,
    );
    for (const field of ["summary", "keyboard", "limits", "tasks"])
      assert.ok(
        typeof guide[field] === "string" && guide[field].trim(),
        `${guide.name}.${field}`,
      );
    assert.ok(guide.detail && typeof guide.detail === "object");
    for (const field of detailFields)
      assert.ok(
        typeof guide.detail[field] === "string" && guide.detail[field].trim(),
        `${guide.name}.detail.${field}`,
      );
    assert.ok(Array.isArray(guide.props));
    for (const prop of guide.props)
      assert.ok(
        Array.isArray(prop) &&
          prop.length === 4 &&
          prop.every((value) => typeof value === "string" && value.trim()),
        `${guide.name} prop row`,
      );
  }
  return data;
}

export function renderComponentGuides(data, version) {
  const family = new Map(data.families.map((item) => [item.id, item.example]));
  const cell = (value) => value.replaceAll("|", "\\|").replaceAll("\n", " ");
  let text = `# Component guides\n\nAuthored contracts for ${version}, generated from [docs/component-guides.json](docs/component-guides.json). All ${data.components.length} existing core component guides share the same maintained source with the catalogue. Types/defaults and executable family examples are checked against the emitted release. This is pre-1.0 documentation, not a new stability or accessibility certification. Optional scene exports retain [THREE.md](THREE.md).\n\n## Setup\n\nImport scoped.css once and render inside contour-root or ThemeScope; system fonts need no extra import. Reset/fonts/providers are opt-in by need. Copy a linked complete TSX family example into your React application; its actions/data are local illustrations. No private catalogue source is required. Existing JavaScript onboarding remains in [GETTING-STARTED.md](GETTING-STARTED.md).\n\n`;
  text +=
    '```tsx\nimport { Button } from "@abuzareal/contour-ui";\nimport "@abuzareal/contour-ui/scoped.css";\nexport default function Example() {\n  return <div className="contour-root"><Button>Example action</Button></div>;\n}\n```\n\n';
  text +=
    "## Index\n\n" +
    data.components
      .map((guide) => `- [${guide.name}](#${guide.name.toLowerCase()})`)
      .join("\n") +
    "\n\n";
  const sections = [
    ["Purpose and alternatives", "use"],
    ["Anatomy and parts", "anatomy"],
    ["State ownership", "state"],
    ["Native forms and reset", "forms"],
    ["Ref target", "ref"],
    ["CSS and tokens", "styling"],
    ["Loading, errors and long content", "edgeCases"],
    ["RTL and localization", "localization"],
  ];
  for (const guide of data.components) {
    text += `## ${guide.name}\n\n${guide.summary}\n\n### Import and runnable source\n\n\`import { ${guide.name} } from "@abuzareal/contour-ui";\`\n\n[Complete ${guide.family} TSX example](${family.get(guide.family)}) uses the same public components as this guide. The family may compose several exports; it is not another package component.\n\n### Props and explicit defaults\n\n`;
    if (guide.props.length) {
      text +=
        "| Prop | Type | Default | Responsibility |\n| --- | --- | --- | --- |\n";
      for (const prop of guide.props)
        text += "| " + prop.map(cell).join(" | ") + " |\n";
    } else
      text +=
        "No component props. State and geometry are derived from the surrounding document.\n";
    text +=
      "\nThe emitted declaration is authoritative; [metadata](PROP-REFERENCE.md) preserves inherited props and call/construct signatures without inventing browser defaults.\n\n";
    for (const [title, key] of sections)
      text += `### ${title}\n\n${guide.detail[key]}\n\n`;
    text += `### Keyboard and focus\n\n${guide.keyboard}\n\n### Limits and evidence\n\n${guide.limits}\n\n[Support and pending manual checks](SUPPORT.md), [migration](MIGRATION.md), [defining source/types](PUBLIC-API.md). Validate the actual application, platform, content and request flow; automated fixtures are not universal WCAG/device evidence.\n\n[Report ${guide.name} ${version}](https://github.com/abuzareal/contour-ui/issues/new?template=bug_report.yml&component=${encodeURIComponent(guide.name)}&version=${version}) using the [public reproduction](examples/reproduction).\n\n`;
  }
  return text.trimEnd() + "\n";
}

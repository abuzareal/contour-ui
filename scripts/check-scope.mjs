import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
const base = process.env.CONTOUR_BASE_SHA ?? "";
let paths;
if (/^[a-f0-9]{40,64}$/.test(base) && !/^0+$/.test(base)) {
  try {
    paths = execFileSync("git", ["diff", "--name-only", "-z", base, "HEAD"], {
      encoding: "utf8",
    })
      .split("\0")
      .filter(Boolean);
  } catch {
    /* Unknown history gets the complete gates. */
  }
}
const runtime =
  !paths?.length ||
  !paths.every(
    (path) =>
      path.endsWith(".md") || path.startsWith(".github/ISSUE_TEMPLATE/"),
  );
const next =
  !paths?.length ||
  paths.some((path) =>
    /^(package(?:-lock)?\.json|src\/|styles\/|scripts\/(?:build|test-next|packed-archive)|\.github\/workflows\/)/.test(
      path,
    ),
  );
const output = `runtime=${runtime}\nnext=${next}\n`;
if (process.env.GITHUB_OUTPUT)
  appendFileSync(process.env.GITHUB_OUTPUT, output);
process.stdout.write(output);

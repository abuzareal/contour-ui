import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { packedArchive } from "./packed-archive.mjs";

const run = (command, args, env = process.env) =>
  execFileSync(command, args, { stdio: "inherit", env });
const directory =
  process.env.CONTOUR_RELEASE_DIR ??
  (await mkdtemp(join(tmpdir(), "contour-release-")));
try {
  run("npm", ["run", "validate"]);
  const archive = await packedArchive(directory);
  const checksum = createHash("sha256")
    .update(await readFile(archive))
    .digest("hex");
  const env = { ...process.env, CONTOUR_ARCHIVE: archive };
  run("npm", ["run", "test:compat"], env);
  run(process.execPath, ["scripts/test-next.mjs"], env);
  run(process.execPath, ["scripts/test-next.mjs"], {
    ...env,
    CONTOUR_NEXT_OPTIONAL: "1",
  });
  run("npm", ["audit", "--audit-level=low"]);
  if (
    createHash("sha256")
      .update(await readFile(archive))
      .digest("hex") !== checksum
  )
    throw Error("The verified archive changed during checks");
  await writeFile(
    join(directory, "verified-archive.json"),
    JSON.stringify({ archive, checksum, algorithm: "sha256" }, null, 2) + "\n",
  );
  console.log(`Verified archive: ${archive}\nSHA-256: ${checksum}`);
} finally {
  if (!process.env.CONTOUR_RELEASE_DIR)
    await rm(directory, { recursive: true, force: true });
}

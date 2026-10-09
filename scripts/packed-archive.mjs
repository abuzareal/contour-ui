import { execFileSync } from "node:child_process";
import { stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";

export async function packedArchive(destination) {
  if (process.env.CONTOUR_ARCHIVE) {
    const archive = resolve(process.env.CONTOUR_ARCHIVE);
    if (!(await stat(archive)).isFile())
      throw Error("CONTOUR_ARCHIVE must identify a package archive");
    return archive;
  }
  const result = JSON.parse(
    execFileSync(
      "npm",
      [
        "pack",
        "--json",
        "--ignore-scripts",
        "--pack-destination",
        destination,
        "--cache",
        join(tmpdir(), "contour-ui-npm-cache"),
      ],
      { encoding: "utf8" },
    ),
  );
  const archive = Array.isArray(result) ? result[0] : Object.values(result)[0];
  return join(destination, archive.filename);
}

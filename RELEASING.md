# Releasing Contour UI

Source is public at [github.com/abuzareal/contour-ui](https://github.com/abuzareal/contour-ui); the package is public under MIT. Query npm for the latest published version; the source manifest does not prove publication. Source changes are not delivered to consumers until publication and an exact dependency/lockfile update. The npm README changes only when a new version is published; do not overwrite or unpublish an existing version to edit it.

Before selecting a release version, review public API and visual changes, types, dependencies, licenses, changelog and compatibility limits. Use patch for compatible fixes, minor for additions, and document every incompatible 0.x change explicitly. README examples must match the archive. Record publication dates only after verifying the registry. A local check is not deployment evidence.

## Verify and publish one archive

1. Obtain maintainer authorization to publish; validation alone is not authorization.
2. Select an unused registry version and update package.json, its lockfile and release notes. Never reuse an existing registry version; a locally verified archive does not make it publishable under an already released version. Use a reviewed release commit on main and a matching `vVERSION` tag. The hosted workflow checks the tag version and that its source is an ancestor of origin/main. It cannot publish from a pull request.
3. Run `npm ci --ignore-scripts`; install Chromium once with `npx playwright install chromium`. Use Node 22.12+ or 24+.
4. Set `CONTOUR_RELEASE_DIR` to an existing temporary directory and run `npm run verify:release`. It runs validate once, packs one archive, tests that archive in clean React 18/19 core and optional consumers plus the pinned Next App Router fixture, audits dependencies, and writes `verified-archive.json` with its SHA-256. Core consumers must have no Three.js or Lenis installed. Review failures and advisories instead of bypassing gates.
5. Inspect the archive contents, verify its checksum against `verified-archive.json`, and publish that exact path using `npm publish /absolute/path/to/archive.tgz --ignore-scripts --access public`. `--ignore-scripts` is appropriate here because that exact archive has already passed the release gates; it is not permission to publish an unchecked package. Source `npm publish` retains a prepublishOnly guard. The hosted workflow verifies the checksum again and publishes the archive with provenance, avoiding duplicate source gates.
6. The owner completes npm authentication/2FA personally. Never put tokens, OTPs or credentials in this repository or logs. Prefer configured trusted publishing and short-lived identity over persistent tokens.
7. Verify registry version, tarball/integrity and publication date; install that exact registry version in each affected consumer, commit its manifest/lockfile, and run its required checks before deployment. Do not substitute a local link or source copy for release validation.

The tag workflow is configured for a public repository on main. Configuration does not prove that its npm trusted-publisher relationship is active; check npm/GitHub settings before relying on it. Publication requires authorization even when CI passes.

## Validation cost

Browser checks remain for native dialog, reset timing and graphics lifecycle behavior. jsdom does not reproduce all browser default actions. Compatibility checks reuse one archive and avoid another library build when `CONTOUR_ARCHIVE` is provided. Documentation-only diffs retain types, lint, build, archive checks and audit; runtime diffs keep component, browser and complete compatibility checks. Changes to components, hooks, entries, styles, build/package configuration or the Next fixture also run the pinned Next check. Unknown history falls back to complete gates. No measured CI speedup is claimed until the updated workflow has run.

Dependabot proposes dependency/action changes for review; changes are not auto-merged. Actions use pinned revisions and minimal permissions. Do not enable paid runners or private distribution as part of a release. Contributor and application checks remain separate from registry/deployment verification.

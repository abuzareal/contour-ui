# Releasing Contour UI

## Package-page documentation and release notes

The npm Readme tab renders the root `README.md`. npm updates it when a new package version is published; editing this repository does not update the existing npm page. Follow [npm's README update guidance](https://docs.npmjs.com/about-package-readme-files/). Do not try to overwrite a published version or unpublish it to change documentation.

Keep installation, a working example, CSS/theme setup, supported APIs, optional dependencies, limits, and a release summary in the README. Keep the detailed version history in `CHANGELOG.md`, which ships in the archive and is available through npm's Code view. The private GitHub repository is not a public documentation destination. When public docs and changelog routes exist, add their verified URLs to the README and package metadata.

Write new changes under **Unreleased**, or under a version heading explicitly marked **Pending release** when the next version has been chosen. At publication, remove the pending label and record the verified publication date. Use sections only when they contain useful changes: Added, Fixes, Compatibility, Upgrading, and Known limitations. Each entry should name the affected component/API and describe the user's resulting behavior. Include a migration example for incompatible changes. For a documentation-only patch, state that runtime behavior and dependency contracts are unchanged.

Link each release to available evidence: changed APIs, relevant tests, and public issues/PRs when readers can access them. Do not invent dates, issue numbers, performance gains, accessibility certification, or compatibility results. Confirm that README examples use the exports and props in the release archive. Run the same release gates for a documentation patch; the archive, manifest, tag, changelog, and registry version must agree. Publishing still requires the maintainer's authorization.

## Initial release

1. Verify `npm whoami` is `abuzareal`; the package is `@abuzareal/contour-ui` and public under MIT.
2. Run `npm ci --ignore-scripts`, install Chromium with `npx playwright install chromium` on a new machine, then run `npm run validate`, `npm run test:compat`, and `npm audit`. Review every advisory; do not release with unexplained audit findings.
3. Test the actual packed archive in clean React 18 and React 19 consumers without optional Three.js or Lenis, and in the catalogue and portfolio with their full browser suites.
4. Check `npm pack --dry-run --json` and licenses. No private data, credentials, unrelated assets, maps, or app content may enter the archive.
5. Push the reviewed source and release commit to the independent GitHub repository. The owner currently keeps this repository private; the npm distribution remains public under MIT.
6. Set `private` to `false` only for an approved, validated release. Publish from the verified owner account: `npm publish --access public`. Complete npm's required authentication/2FA personally.
7. Verify registry metadata, install the exact registry version in both consumers, rerun checks, and commit the manifest/lockfile changes. Do not commit temporary filesystem/archive dependencies.
8. Tag the matching package version and record the release. Every future release requires a new version; npm versions cannot be overwritten.

## Future trusted releases

After the first package exists, configure npm's GitHub trusted publisher for owner `abuzareal`, repository `contour-ui`, workflow `release.yml`. Authenticate interactively to set this relationship; do not paste credentials into code or chat. Enable two-factor authentication on the owner account and prefer disabling ordinary token publishing after trusted publishing has been successfully verified.

With account 2FA enabled, configure and verify the relationship using npm 11.15 or later:

```sh
npm trust github @abuzareal/contour-ui --file release.yml --repo abuzareal/contour-ui --allow-publish
npm trust list @abuzareal/contour-ui
```

The release workflow accepts a manually dispatched version already present in package.json and requires the matching `vVERSION` tag to identify its source. It reruns validation, dependency audit, and clean-consumer tests before publishing with provenance. Push the reviewed release commit to main before tagging. Never publish from a pull-request event or add a persistent npm token to the workflow.

The repository is currently private, so the configured workflow deliberately skips publishing. Release locally after running the checklist. Trusted publishing can be configured for a private repository, but npm does not support provenance attestations from private source repositories. If hosted releases are enabled later, review private-runner spending settings and remove the explicit provenance requirement for private source. The current workflow is ready for a future public repository and must not be presented as active automation while the repository stays private.

Increment PATCH for compatible fixes, MINOR for compatible additions, and MAJOR for incompatible APIs or substantial incompatible default behavior. While the package is at 0.x, document every change carefully and keep consumers pinned to exact versions. Review visual changes in consuming apps even when the API is compatible.

## Dependency updates and cost

Dependabot is selected because it is integrated with GitHub and requires no extra hosted service or bot account. It proposes weekly npm and action updates; the library is not auto-merged. npm distribution is public. Standard-hosted Actions run only if the repository is public; checks run locally while it stays private. Do not enable paid runners, private npm distribution, or paid security subscriptions as part of this setup.

The library's validation workflows deliberately skip private repositories. Consumer policies vary: Portfolio allows private pull requests to opt in with the `run-validation` label. Check each consumer's workflow and run its required checks locally when CI is skipped. Enabling private-repository Actions requires reviewing that account's included usage and spending settings first.

Consumers install with `npm install @abuzareal/contour-ui@VERSION --save-exact`, commit their lockfile, run their checks, and redeploy. Portfolio, Design-System, Atmos, Orbit, and the library remain independent repositories.

The compatibility gate also installs the optional Three.js and Lenis peers in separate packed consumers. It checks `/three` and `/scroll` with `skipLibCheck: false`, builds their imports, and verifies the Latin WOFF2 export. Core consumers continue to run without those optional peers. Run `npm run test:optional` for that focused check.

# Releasing Contour UI

## Initial release

1. Verify `npm whoami` is `abuzareal`; the package is `@abuzareal/contour-ui` and public under MIT.
2. Run `npm ci --ignore-scripts`, `npm run validate`, and `npm audit`. Review every advisory; do not release with unexplained audit findings.
3. Test the actual packed archive in a clean React consumer without optional Three.js or Lenis, and in the catalogue and portfolio with their full browser suites.
4. Check `npm pack --dry-run --json` and licenses. No private data, credentials, unrelated assets, maps, or app content may enter the archive.
5. Create the independent public GitHub repository and push the reviewed source and release commit.
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

Increment PATCH for compatible fixes, MINOR for compatible additions, and MAJOR for incompatible APIs or substantial incompatible default behavior. While the package is at 0.x, document every change carefully and keep consumers pinned to exact versions. Review visual changes in consuming apps even when the API is compatible.

## Dependency updates and cost

Dependabot is selected because it is integrated with GitHub and requires no extra hosted service or bot account. It proposes weekly npm and action updates; the library is not auto-merged. Public npm distribution and public GitHub standard-hosted Actions are used. Do not enable paid runners, private npm distribution, or paid security subscriptions as part of this setup.

The validation workflows deliberately skip private repositories. If a consumer stays private, run its checks locally before merging dependency updates. Enabling private-repository Actions later requires reviewing that account's included usage and spending settings first.

Consumers install with `npm install @abuzareal/contour-ui@VERSION --save-exact`, commit their lockfile, run their checks, and redeploy. Keep the three Git repositories independent.

# Minimal component / overlay / form reproduction

Copy this folder alone into an empty directory. Run npm install --strict-peer-deps, npm run build and npm run preview. Versions are pinned in package.json; commit the generated lockfile. There are no workspace aliases or private catalogue dependencies. Use npm ci once your application lockfile exists.

Keep a failing interaction in src/main.tsx and remove unrelated UI. Include installed Contour/React/browser versions, expected/actual behavior, keyboard steps, theme, viewport and the smallest input data. Replace names and service URLs with synthetic data; never include credentials, customer records or private repository links. A public repository or sandbox can use this standalone folder.

[Report a Contour 0.6.0 Combobox issue](https://github.com/abuzareal/contour-ui/issues/new?template=bug_report.yml&title=Combobox%200.6.0%3A%20&component=Combobox&version=0.6.0)

Candidate versions need the package to be published before registry installation; the maintainer tests the same source against the packed candidate first.

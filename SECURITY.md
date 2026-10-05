# Security

Report suspected vulnerabilities privately using GitHub's private vulnerability reporting for this repository once enabled. If that option is unavailable, contact the maintainer privately through their GitHub profile; do not post exploit details or credentials in a public issue.

The latest published release is the supported version. Dependency audits identify known reported vulnerabilities, not all possible defects. No claim of complete security or formal accessibility certification is made.

The core has no telemetry, remote asset requests, data-fetching services, raw HTML injection API, or consumer installation scripts. React escapes text content. Link wrappers reject protocols outside HTTP, HTTPS, mailto, and tel. Consumers remain responsible for trusted children, callbacks, CSP, application data validation, and authorization.

Publication is limited to built library files and release documentation. The package-content gate rejects source maps, credentials/config files, archive files, and unexpected top-level paths. Optional rendering modules must be imported explicitly.

Release controls: lockfile review, full dependency audit, typechecking, linting, regression tests, package archive inspection, independent consumer builds and browser tests, and a documented release. GitHub workflows run with minimal permissions and pinned action revisions. Trusted publishing is preferred over long-lived npm tokens. Never commit `.npmrc`, `.env`, recovery codes, or tokens.

# Optional Three reference

These experimental exports live at `@abuzareal/contour-ui/three`. Core components do not import Three or Lenis. Install the declared Three peer (and matching @types/three for TypeScript), load the entry lazily and import component styles deliberately. [GETTING-STARTED.md](GETTING-STARTED.md) contains the actual lazy static-fallback/sizing/pause recipe. [PUBLIC-API.md](PUBLIC-API.md) links exact source and types; experimental does not mean unversioned or safe to deep-import.

## Scene components

Sculpture requires `{motionEnabled: boolean}` and renders the fixed three-link brand scene in a loading/ready/unavailable host. ObjectStudy requires `{label: string, motionEnabled: boolean, study: "materials" | "geometry"}` and renders an aria-labelled image host with four related objects. These are authored visual studies, not a general model viewer, arbitrary asset loader or application data visualization. The caller supplies block sizing and adjacent meaningful text. No native ref/imperative scene API is exposed by these two components. Key/remount when setup inputs such as study must change; current scene setup is captured at mount.

Unavailable WebGL or partial setup leaves an unavailable host; it does not manufacture a fallback. Keep useful static DOM/SVG outside SceneBoundary/Suspense. SceneBoundary catches React descendant errors and hides failed scene content; it has no fallback prop and does not replace domain content. Headless success does not certify physical GPUs, every browser or context restoration with custom resources.

## useThreeStage

`useThreeStage(hostRef, {motionEnabled, setup, cameraDistance})` returns void. hostRef targets a connected sized HTMLDivElement. setup(context) and cameraDistance(aspect) are captured once per mount; remount for a new setup/framing contract. motionEnabled updates without remounting. Camera distance must be finite and appropriate for the scene/aspect; no automatic framing of arbitrary external objects is promised.

StageContext contains scene, PerspectiveCamera, WebGLRenderer and optional onDispose(cleanup). Register each allocated resource immediately, before later code can throw. StageScene requires update(frame), rest() and dispose(); resize() is optional. StageFrame contains delta seconds (bounded to 0–0.05), accumulated running elapsed seconds and a Vector2 pointer offset in -0.5..0.5. Do not dispose the same material/geometry through both onDispose and dispose; register one owner. When shared among meshes, dispose shared resources once.

The stage owns renderer/canvas, neutral tone mapping, studio lights/environment, resize/intersection/visibility/context listeners and its animation frame. Device pixel ratio is capped at 1.75. Frames run only with motion enabled, intersection visibility, visible document and usable context; pause snaps to rest and redraws. The application combines system reduced motion and app pause before passing motionEnabled. Context loss marks unavailable and stops updates; restoration redraws/resumes. Setup failures and unmount run registered disposers in reverse order, including allocations registered before setup returned. A failing disposer is reported and does not prevent later cleanup. The caller owns custom resource allocation, cleanup, fetching, asset rights and fallback meaning.

## Material and geometry factories

| Export             | Result and ownership                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| createChrome       | New MeshStandardMaterial: neutral chrome, metalness1/roughness0.19. Caller disposes it.                                                                       |
| createLime         | New MeshStandardMaterial: authored lime, metalness0.25/roughness0.26. Caller disposes it.                                                                     |
| createInk          | New MeshStandardMaterial: dark matte, metalness0.1/roughness0.62. Caller disposes it.                                                                         |
| createGlass        | New MeshPhysicalMaterial with transmission/thickness/attenuation; caller disposes it. It is not a general physically validated optical simulation.            |
| createLinkGeometry | New centred beveled/extruded rounded-square link geometry; caller disposes it.                                                                                |
| createMaterialSet  | ObjectSet of four meshes sharing link geometry with chrome/lime/ink/glass materials. Call set.dispose once; do not also dispose shared members independently. |
| createGeometrySet  | ObjectSet of torus knot, icosahedron, rounded box and capsule meshes with authored materials. Call set.dispose once.                                          |
| objectStudies      | Selection mapping materials→createMaterialSet, geometry→createGeometrySet. Factories create new owned sets; this is not an allocated global scene.            |

ObjectSet is `{objects: THREE.Object3D[]; dispose: () => void}`. Disposal releases factory-owned geometry/materials; it does not remove caller-added objects from a scene or dispose unrelated textures. ObjectStudyKind is `keyof typeof objectStudies`. Factories do not create render loops, fetch files or install event listeners. Future shape/material additions remain demand-led and measured; importing optional helpers does not justify making Three a core dependency.

## Setup and lifecycle limits

Use one stage owner per host, stable setup and deliberate size. Product controls, labels, keyboard alternatives and observed data belong outside decorative canvas. There is no animation-control timeline, general object selection, scene editor, SSR WebGL renderer or universally verified third-party modal interoperability. Optional declaration/build and sampled lifecycle checks are distinct from the [dated support matrix](SUPPORT.md). Inspect public code and reproduce with synthetic scenes rather than private assets.

## Version and reproduction

Reference version **0.6.4**. A source version does not establish publication; check the npm registry for availability. [Versioned source](https://github.com/abuzareal/contour-ui/tree/v0.6.4/src) and [emitted type inventory](PUBLIC-API.md) describe this contract; tag links resolve after release. [Report Three 0.6.4](https://github.com/abuzareal/contour-ui/issues/new?template=bug_report.yml&component=Three&version=0.6.4), using the [public minimal reproduction](examples/reproduction) and synthetic data.

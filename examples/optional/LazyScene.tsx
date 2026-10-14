"use client";
import { lazy, Suspense, useState } from "react";
import {
  Button,
  SceneBoundary,
  useMotionPreference,
} from "@abuzareal/contour-ui";
import "./optional.css";
const Sculpture = lazy(() =>
  import("@abuzareal/contour-ui/three").then((module) => ({
    default: module.Sculpture,
  })),
);
export function LazyScene() {
  const [loaded, setLoaded] = useState(false),
    [paused, setPaused] = useState(false);
  const reducedMotion = useMotionPreference();
  return (
    <figure>
      <div className="recipe-scene-visual">
        <div
          className="recipe-scene-fallback"
          role="img"
          aria-label="Three interlocking sculptural links"
        >
          <svg aria-hidden="true" viewBox="0 0 300 180">
            <g fill="none" stroke="currentColor" strokeWidth="16">
              <ellipse
                cx="95"
                cy="78"
                rx="52"
                ry="29"
                transform="rotate(-25 95 78)"
              />
              <ellipse
                cx="165"
                cy="95"
                rx="52"
                ry="29"
                transform="rotate(25 165 95)"
              />
              <ellipse
                cx="215"
                cy="62"
                rx="40"
                ry="25"
                transform="rotate(-35 215 62)"
              />
            </g>
          </svg>
        </div>
        {loaded && (
          <div className="recipe-scene-layer" aria-hidden="true">
            <SceneBoundary>
              <Suspense fallback={null}>
                <Sculpture motionEnabled={!paused && !reducedMotion} />
              </Suspense>
            </SceneBoundary>
          </div>
        )}
      </div>
      <figcaption>
        Three linked forms. The static study remains available if 3D cannot
        load.
      </figcaption>
      <Button onClick={() => setLoaded(true)} disabled={loaded}>
        Load 3D study
      </Button>
      <button
        type="button"
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        Pause motion
      </button>
    </figure>
  );
}

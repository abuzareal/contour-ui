/** Shared Three.js stage: renderer, studio lighting, resizing, a visibility-aware render loop, pointer tracking, and cleanup. */
import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type StageFrame = {
  delta: number;
  elapsed: number;
  /** Pointer offset from the stage centre, each axis in -0.5..0.5. */
  pointer: THREE.Vector2;
};

export type StageScene = {
  update: (frame: StageFrame) => void;
  /** Snaps to a still pose when motion is turned off. */
  rest: () => void;
  dispose: () => void;
};

export type StageContext = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
};

type StageOptions = {
  motionEnabled: boolean;
  setup: (context: StageContext) => StageScene;
  /** Camera z for a given aspect ratio, keeping the subject framed. */
  cameraDistance: (aspect: number) => number;
};

const maxPixelRatio = 1.75;

export default function useThreeStage(
  hostRef: RefObject<HTMLDivElement | null>,
  { motionEnabled, setup, cameraDistance }: StageOptions,
) {
  const motionRef = useRef(motionEnabled);
  const syncRef = useRef<(() => void) | undefined>(undefined);
  // Setup and framing run once per mount; later prop changes are not re-applied.
  const setupRef = useRef({ setup, cameraDistance });

  useEffect(() => {
    motionRef.current = motionEnabled;
    syncRef.current?.();
  }, [motionEnabled]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      host.dataset.state = "unavailable";
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    renderer.setClearColor(0x000000, 0);
    // Neutral tone mapping keeps the lime close to the CSS accent colour.
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    // Studio lighting shared by every stage so materials read consistently.
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
    camera.position.set(0, 0, 10.5);
    const environment = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(renderer);
    const environmentMap = generator.fromScene(environment, 0.04);
    scene.environment = environmentMap.texture;
    environment.dispose();
    generator.dispose();
    const keyLight = new THREE.DirectionalLight(0xffffff, 4);
    keyLight.position.set(4, 5, 6);
    const rimLight = new THREE.DirectionalLight(0xcad9ff, 3);
    rimLight.position.set(-5, 1, -2);
    scene.add(keyLight, rimLight, new THREE.AmbientLight(0xffffff, 0.7));

    const stage = setupRef.current.setup({ scene, camera, renderer });

    // Loop state: frames run only while visible, focused, and motion is on.
    const pointer = new THREE.Vector2();
    let visible = true;
    let contextLost = false;
    let running = false;
    let frame = 0;
    let elapsed = 0;
    let previousTime = 0;

    const render = () => {
      if (contextLost) return;
      renderer.render(scene, camera);
      host.dataset.state = "ready";
    };
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.position.z = setupRef.current.cameraDistance(camera.aspect);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      render();
    };
    const trackPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !motionRef.current) return;
      const bounds = host.getBoundingClientRect();
      pointer.set(
        (event.clientX - bounds.left) / bounds.width - 0.5,
        (event.clientY - bounds.top) / bounds.height - 0.5,
      );
    };
    const resetPointer = () => pointer.set(0, 0);
    const animate = (time: number) => {
      if (!running) return;
      const delta = Math.min(Math.max(time - previousTime, 0) / 1000, 0.05);
      previousTime = time;
      elapsed += delta;
      stage.update({ delta, elapsed, pointer });
      render();
      frame = requestAnimationFrame(animate);
    };
    /** Starts or stops the loop to match visibility and motion; snaps to rest when paused. */
    const sync = () => {
      const motion = motionRef.current;
      const shouldRun = motion && visible && !document.hidden && !contextLost;
      if (shouldRun && !running) {
        running = true;
        previousTime = performance.now();
        frame = requestAnimationFrame(animate);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
      if (!motion) {
        pointer.set(0, 0);
        stage.rest();
        render();
      }
    };
    syncRef.current = sync;
    const loseContext = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      host.dataset.state = "unavailable";
      sync();
    };
    const restoreContext = () => {
      contextLost = false;
      render();
      sync();
    };
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) render();
      sync();
    });
    const resizeObserver = new ResizeObserver(resize);

    visibilityObserver.observe(host);
    resizeObserver.observe(host);
    host.addEventListener("pointermove", trackPointer);
    host.addEventListener("pointerleave", resetPointer);
    document.addEventListener("visibilitychange", sync);
    renderer.domElement.addEventListener("webglcontextlost", loseContext);
    renderer.domElement.addEventListener(
      "webglcontextrestored",
      restoreContext,
    );
    resize();
    sync();

    return () => {
      running = false;
      syncRef.current = undefined;
      cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      host.removeEventListener("pointermove", trackPointer);
      host.removeEventListener("pointerleave", resetPointer);
      document.removeEventListener("visibilitychange", sync);
      renderer.domElement.removeEventListener("webglcontextlost", loseContext);
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        restoreContext,
      );
      stage.dispose();
      environmentMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [hostRef]);
}

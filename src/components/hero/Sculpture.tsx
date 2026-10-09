"use client";

/** Hero sculpture: three chrome/lime links that follow the pointer and drift while motion is on. */
import { useRef } from "react";
import * as THREE from "three";
import useThreeStage, {
  type StageContext,
  type StageFrame,
} from "../../hooks/useThreeStage.js";
import {
  createChrome,
  createLime,
  createLinkGeometry,
} from "../../lib/threeMaterials.js";

export type SculptureProps = {
  motionEnabled: boolean;
};

const restRotation = new THREE.Euler(-0.15, -0.1, -0.1);

function setupSculpture({ scene, onDispose }: StageContext) {
  const chrome = createChrome();
  onDispose?.(() => chrome.dispose());
  const lime = createLime();
  onDispose?.(() => lime.dispose());
  const geometry = createLinkGeometry();
  onDispose?.(() => geometry.dispose());

  // Three interlocking links arranged as one assembly.
  const assembly = new THREE.Group();
  const firstLink = new THREE.Mesh(geometry, chrome);
  firstLink.position.set(-0.76, 0.42, 0);
  firstLink.rotation.set(0.4, -0.3, -0.4);
  const secondLink = new THREE.Mesh(geometry, lime);
  secondLink.position.set(0.62, -0.15, 0.1);
  secondLink.rotation.set(0.25, 1.2, -0.35);
  const thirdLink = new THREE.Mesh(geometry, chrome);
  thirdLink.position.set(0.25, -0.83, -0.13);
  thirdLink.scale.setScalar(0.8);
  thirdLink.rotation.set(1.3, 0.1, 0.5);
  assembly.add(firstLink, secondLink, thirdLink);
  assembly.rotation.copy(restRotation);
  scene.add(assembly);

  return {
    update: ({ delta, elapsed, pointer }: StageFrame) => {
      const damping = 1 - Math.exp(-delta * 4);
      assembly.rotation.y = THREE.MathUtils.lerp(
        assembly.rotation.y,
        pointer.x * 0.65 + Math.sin(elapsed * 0.22) * 0.12,
        damping,
      );
      assembly.rotation.x = THREE.MathUtils.lerp(
        assembly.rotation.x,
        pointer.y * 0.4 + restRotation.x,
        damping,
      );
      assembly.position.y = Math.sin(elapsed * 0.65) * 0.07;
    },
    rest: () => {
      assembly.rotation.copy(restRotation);
      assembly.position.y = 0;
    },
    dispose: () => {
      scene.remove(assembly);
    },
  };
}

const cameraDistance = (aspect: number) => Math.max(8.6, 5.5 / aspect);

export default function Sculpture({ motionEnabled }: SculptureProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  useThreeStage(hostRef, {
    motionEnabled,
    setup: setupSculpture,
    cameraDistance,
  });

  return (
    <div ref={hostRef} className="sculpture-canvas" data-state="loading" />
  );
}

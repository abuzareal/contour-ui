/** Object sets for the design system's 3D studies, built from the brand materials. */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  createChrome,
  createGlass,
  createInk,
  createLime,
  createLinkGeometry,
} from "./threeMaterials.js";

export type ObjectSet = {
  objects: THREE.Object3D[];
  dispose: () => void;
};

/** The hero link rendered in each brand material. */
export function createMaterialSet(): ObjectSet {
  const geometry = createLinkGeometry();
  const materials = [createChrome(), createLime(), createInk(), createGlass()];
  return {
    objects: materials.map((material) => new THREE.Mesh(geometry, material)),
    dispose: () => {
      geometry.dispose();
      materials.forEach((material) => material.dispose());
    },
  };
}

/** Primitive forms that share the sculpture's materials and lighting. */
export function createGeometrySet(): ObjectSet {
  const geometries: THREE.BufferGeometry[] = [
    new THREE.TorusKnotGeometry(0.82, 0.28, 180, 24),
    new THREE.IcosahedronGeometry(1.15, 0),
    new RoundedBoxGeometry(1.7, 1.7, 1.7, 6, 0.32),
    new THREE.CapsuleGeometry(0.62, 1.1, 12, 32),
  ];
  const materials = [createChrome(), createLime(), createInk(), createChrome()];
  materials[1].flatShading = true;
  return {
    objects: geometries.map(
      (geometry, index) => new THREE.Mesh(geometry, materials[index]),
    ),
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}

/** Named sets, so callers can choose one without importing Three.js themselves. */
export const objectStudies = {
  materials: createMaterialSet,
  geometry: createGeometrySet,
} satisfies Record<string, () => ObjectSet>;

export type ObjectStudyKind = keyof typeof objectStudies;

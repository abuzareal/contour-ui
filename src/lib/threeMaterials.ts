/** Brand materials and the rounded-link geometry shared by every Three.js stage. */
import * as THREE from "three";

export const createChrome = () =>
  new THREE.MeshStandardMaterial({
    color: 0xd8dfdf,
    metalness: 1,
    roughness: 0.19,
    envMapIntensity: 1.8,
  });

export const createLime = () =>
  new THREE.MeshStandardMaterial({
    color: 0xccff00,
    metalness: 0.25,
    roughness: 0.26,
    envMapIntensity: 1.2,
  });

export const createInk = () =>
  new THREE.MeshStandardMaterial({
    color: 0x1d1f1b,
    metalness: 0.1,
    roughness: 0.62,
    envMapIntensity: 0.9,
  });

/** Lime-tinted glass: attenuation gives the body colour so it reads on pale backgrounds. */
export const createGlass = () =>
  new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.1,
    transmission: 1,
    thickness: 1.4,
    ior: 1.5,
    attenuationColor: 0x9cc21f,
    attenuationDistance: 1.1,
    clearcoat: 1,
    envMapIntensity: 1.6,
  });

function roundedSquare(size: number, radius: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-size + radius, -size);
  shape.lineTo(size - radius, -size);
  shape.quadraticCurveTo(size, -size, size, -size + radius);
  shape.lineTo(size, size - radius);
  shape.quadraticCurveTo(size, size, size - radius, size);
  shape.lineTo(-size + radius, size);
  shape.quadraticCurveTo(-size, size, -size, size - radius);
  shape.lineTo(-size, -size + radius);
  shape.quadraticCurveTo(-size, -size, -size + radius, -size);
  return shape;
}

/** The bevelled, rounded-square link that forms the hero sculpture. */
export function createLinkGeometry() {
  const shape = roundedSquare(1.25, 0.48);
  shape.holes.push(new THREE.Path(roundedSquare(0.79, 0.29).getPoints(24)));
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.34,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.12,
    bevelThickness: 0.12,
    curveSegments: 24,
  });
  geometry.center();
  return geometry;
}

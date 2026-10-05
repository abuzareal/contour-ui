/** Lays out a set of 3D objects in a responsive grid; each turns slowly and the set leans toward the pointer. */
import { useRef } from "react";
import * as THREE from "three";
import useThreeStage, {
  type StageContext,
  type StageFrame,
} from "../../hooks/useThreeStage.js";
import { objectStudies, type ObjectStudyKind } from "../../lib/threeStudies.js";

export type ObjectStudyProps = {
  label: string;
  motionEnabled: boolean;
  study: ObjectStudyKind;
};

const spacing = 3.2;
const restTilt = new THREE.Euler(-0.25, 0.5, 0);

/** Four across on wide stages, two by two on narrow ones. */
const columnsFor = (aspect: number) => (aspect < 1.4 ? 2 : 4);

const cameraDistance = (aspect: number) => {
  const columns = columnsFor(aspect);
  const rows = 4 / columns;
  const width = columns * spacing;
  const height = rows * spacing;
  // tan(17.5deg) * 2 converts a 35deg field of view into visible height per unit distance.
  const perUnit = 2 * Math.tan(THREE.MathUtils.degToRad(17.5));
  return Math.max(width / (perUnit * aspect), height / perUnit) + 1.2;
};

export default function ObjectStudy({
  label,
  motionEnabled,
  study,
}: ObjectStudyProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useThreeStage(hostRef, {
    motionEnabled,
    cameraDistance,
    setup: ({ scene, camera }: StageContext) => {
      const set = objectStudies[study]();
      const group = new THREE.Group();
      set.objects.forEach((object) => {
        object.rotation.copy(restTilt);
        group.add(object);
      });
      scene.add(group);

      const arrange = () => {
        const columns = columnsFor(camera.aspect);
        const rows = Math.ceil(set.objects.length / columns);
        set.objects.forEach((object, index) => {
          const column = index % columns;
          const row = Math.floor(index / columns);
          object.position.set(
            (column - (columns - 1) / 2) * spacing,
            ((rows - 1) / 2 - row) * spacing,
            0,
          );
        });
      };
      arrange();

      return {
        update: ({ delta, elapsed, pointer }: StageFrame) => {
          arrange();
          set.objects.forEach((object, index) => {
            object.rotation.y += delta * 0.45;
            object.rotation.x =
              restTilt.x + Math.sin(elapsed * 0.6 + index) * 0.15;
          });
          const damping = 1 - Math.exp(-delta * 3);
          group.rotation.y = THREE.MathUtils.lerp(
            group.rotation.y,
            pointer.x * 0.4,
            damping,
          );
          group.rotation.x = THREE.MathUtils.lerp(
            group.rotation.x,
            pointer.y * 0.3,
            damping,
          );
        },
        rest: () => {
          arrange();
          group.rotation.set(0, 0, 0);
          set.objects.forEach((object) => object.rotation.copy(restTilt));
        },
        dispose: set.dispose,
      };
    },
  });

  return (
    <div
      ref={hostRef}
      className="stage-canvas"
      data-state="loading"
      role="img"
      aria-label={label}
    />
  );
}

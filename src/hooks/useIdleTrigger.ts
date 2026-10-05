/** Becomes true once the browser is idle after `enabled` turns on; used to defer heavy work. */
import { useEffect, useState } from "react";

const idleTimeout = 1200;
const fallbackDelay = 300;

export default function useIdleTrigger(enabled: boolean) {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!enabled || triggered) return;
    const trigger = () => setTriggered(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(trigger, { timeout: idleTimeout });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(trigger, fallbackDelay);
    return () => clearTimeout(id);
  }, [enabled, triggered]);

  return triggered;
}

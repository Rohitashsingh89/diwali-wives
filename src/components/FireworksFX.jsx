import React, { useEffect, useRef, memo, forwardRef, useImperativeHandle } from "react";
import { Fireworks } from "fireworks-js";

const FireworksFX = forwardRef(function FireworksFX(_, ref) {
  const containerRef = useRef(null);
  const fwRef = useRef(null);

  useImperativeHandle(ref, () => ({
    start: () => fwRef.current?.start?.(),
    stop: (dispose = false) => fwRef.current?.stop?.(dispose),
    pause: () => fwRef.current?.pause?.(),
    launch: (n = 1) => fwRef.current?.launch?.(n),
    instance: () => fwRef.current,
  }), []);

  useEffect(() => {
    const el = containerRef.current;
    Object.assign(el.style, {
      position: "fixed",
      inset: "0",
      width: "100vw",
      height: "100vh",
      zIndex: "0",
      pointerEvents: "none",
    });

    fwRef.current = new Fireworks(el, {
      autoresize: true,
      opacity: 0.5,
      acceleration: 1.05,
      friction: 0.97,
      gravity: 1.5,
      particles: 50,
      traceLength: 3,
      traceSpeed: 10,
      explosion: 5,
      intensity: 40,
      flickering: 60,
      hue: { min: 0.0150, max: 0.0450 },
      delay: { min: 30, max: 60 },
      rocketsPoint: { min: 50, max: 50 },
      lineWidth: {
        explosion: { min: 1, max: 3 },
        trace: { min: 1, max: 2 },
      },
      mouse: { click: false, move: false, max: 0 },
      sound: {
        enabled: true,
        files: [
          "/sounds/explosion0.mp3",
          "/sounds/explosion1.mp3",
          "/sounds/explosion2.mp3",
        ],
        volume: { min: 2, max: 57 },
      },
    });

    // Start immediately
    fwRef.current.start();

    // One-time unlock for autoplay policies (first user gesture)
    const unlock = () => {
      fwRef.current?.start?.();
      fwRef.current?.launch?.(10);
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });

    // Always resume when page becomes visible or window gains focus
    const onVis = () => { if (!document.hidden) fwRef.current?.start?.(); };
    const onFocus = () => fwRef.current?.start?.();

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pointerdown", unlock);
      fwRef.current?.stop?.(true);
      fwRef.current = null;
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" />;
});

export default memo(FireworksFX);

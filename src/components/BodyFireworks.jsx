import React, { useEffect, useRef } from "react";
import { Fireworks } from "fireworks-js";

export default function BodyFireworks({ running = true, sounds = [] }) {
  const fwRef = useRef(null);
  const hostRef = useRef(null);

  useEffect(() => {
    const host = document.createElement("div");
    hostRef.current = host;
    Object.assign(host.style, {
      position: "fixed",
      inset: "0",
      width: "100vw",
      height: "100vh",
      zIndex: "0",
      pointerEvents: "none",
    });
    document.body.appendChild(host);

    fwRef.current = new Fireworks(host, {
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
      hue: { min: 0, max: 360 },
      delay: { min: 10, max: 30 },
      rocketsPoint: { min: 50, max: 50 },
      lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } },
      mouse: { click: false, move: false, max: 0 },
      sound: {
        enabled: Boolean(sounds.length),
        files: sounds.length ? sounds : undefined,
        volume: { min: 0.4, max: 0.8 },
      },
    });

    if (running) fwRef.current.start();  // start initially if requested [web:109] 

    const unlock = () => {
      try { fwRef.current?.launch?.(6); } catch {}
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      fwRef.current?.stop?.(true);
      fwRef.current = null;
      host.remove();
    };
  }, []); // create once, independent of app renders [web:91] 

  useEffect(() => {
    const fw = fwRef.current;
    if (!fw) return;
    if (running) fw.start(); else fw.stop(false); // explicit start/stop [web:109] 
  }, [running]);

  return null;
}

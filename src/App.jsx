import React, { useMemo, useState, useEffect, useRef } from "react";
import FireworksFX from "./components/FireworksFX";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";

export default function App() {
  const [name, setName] = useState("");
  const [gateOpen, setGateOpen] = useState(true);
  const [currentWish, setCurrentWish] = useState("");
  const fwRef = useRef(null); // imperative control

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setName(storedName);
      setGateOpen(false); // auto-start if name is saved
    }
  }, []);

  const wishes = useMemo(
    () => [
      "May your code compile on first run, {name} — Happy Diwali! ✨",
      "Lighting diyas and shipping PRs — Shubh Deepavali, {name}! 🪔",
      "Zero bugs, full joys — Happy Diwali, {name}! 🚀",
      "Let your life glow brighter than your IDE theme, {name}! ✨",
      "Deploy joy, rollback stress — Happy Diwali, {name}! 🔥",
      "API of happiness returns 200 OK to you, {name}! 🧡",
      "May your fortunes cache forever, {name} — Shubh Deepavali! 🪔",
    ],
    []
  );

  const pickRandomWish = (person) => {
    const i = Math.floor(Math.random() * wishes.length);
    return wishes[i].replaceAll("{name}", person || "Friend");
  };

  useEffect(() => {
    const tick = () => setCurrentWish(pickRandomWish(name));
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, [name, wishes]);

  const handleAnother = () => setCurrentWish(pickRandomWish(name));

  const notifyBackend = async (name) => {
    try {
      const base = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

      await fetch(`${base}/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
    } catch (err) {
      console.error("Failed to notify backend:", err);
    }
  };
  
  const handleStart = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter your name 🙂", {
        position: "top-center",
        theme: "colored",
        transition: Slide,
      });
      return;
    }

    localStorage.setItem("userName", trimmed);
    setGateOpen(false);
    toast.success(`Happy Diwali, ${trimmed}! ✨`, {
      position: "top-center",
      theme: "colored",
      transition: Slide,
    });
    setCurrentWish(pickRandomWish(trimmed));

    // Ensure fireworks keep running after Enter / Start
    fwRef.current?.start?.();
    fwRef.current?.launch?.(5);

    await notifyBackend(trimmed);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-screen overflow-hidden bg-black/60 backdrop-blur">
      {/* Imperative control via ref */}
      <FireworksFX ref={fwRef} />

      {/* Name Gate Overlay */}
      {gateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="w-11/12 max-w-md rounded-2xl bg-zinc-900/80 border border-zinc-700 p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-yellow-300 text-center">
              Enter your name
            </h2>
            <p className="text-sm text-zinc-300 text-center mt-1">
              Get a personalized Diwali wish 🎉
            </p>
            <div className="mt-5 sm:flex block gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder="e.g. Shyam"
                className="flex-1 rounded-lg bg-zinc-800/80 border sm:w-[250px] w-full border-zinc-600 px-4 py-3 text-zinc-100 outline-none focus:ring-2 focus:ring-yellow-400"
                autoFocus
              />
              <button
                onClick={handleStart}
                className="px-5 py-3 rounded-lg bg-gradient-to-r sm:mt-0 mt-3 sm:w-[100px] w-full from-amber-400 to-orange-500 text-black font-semibold hover:opacity-90"
              >
                Start
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-zinc-400">
              Credit: Rohitash Singh
            </p>
          </div>
        </div>
      )}

      {/* Main Greeting */}
      <h1 className="text-5xl md:text-7xl font-bold text-yellow-400 glow">
        Happy Diwali{!gateOpen && `, ${name || "Friend"}`} 🪔
      </h1>
      <p className="text-lg md:text-2xl text-orange-300 mt-4">
        {currentWish || "Type your name to get a crazy personalized wish!"}
      </p>

      {/* Controls */}
      <div className="mt-6 flex gap-3">
        {!gateOpen && (
          <button
            onClick={handleAnother}
            className="px-5 py-2 rounded-lg border border-amber-400/60 text-amber-300 hover:bg-amber-500/10"
          >
            New Random Wish
          </button>
        )}
        <button
          onClick={() => fwRef.current?.start?.()}
          className="px-5 py-2 rounded-lg border border-emerald-500/80 text-emerald-500/80 font-semibold hover:opacity-90 hover:bg-emerald-500/10"
        >
          Start Fireworks
        </button>
        <button
          onClick={() => fwRef.current?.stop?.(false)} // dispose=false => instance alive, easy resume
          className="px-5 py-2 rounded-lg border border-rose-500/80 text-rose-500/80 font-semibold hover:opacity-90 hover:bg-rose-500/10"
        >
          Stop Fireworks
        </button>
      </div>

      {!gateOpen && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => {
              setGateOpen(true); 
            }}
            className="px-4 py-2 text-sm rounded-lg border border-yellow-600 text-white hover:bg-yellow-700/20"
          >
            <FaRegEdit />
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("userName");
              setName("");
              setGateOpen(true);
              toast.info("Name deleted.", {
                position: "top-center",
                theme: "colored",
                transition: Slide,
              });
            }}
            className="px-4 py-2 text-sm rounded-lg border border-red-600 text-white hover:bg-red-700/20"
          >
            <RiDeleteBin5Line />
          </button>
        </div>
      )}

      <p className="absolute bottom-4 text-xs text-zinc-400">
        Credit: Rohitash Singh
      </p>
      <ToastContainer
        position="top-center"
        theme="colored"
        newestOnTop
        transition={Slide}
      />
    </div>
  );
}

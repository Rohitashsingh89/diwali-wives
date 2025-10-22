import React, { useState, useEffect, useRef } from "react";
import FireworksFX from "./components/FireworksFX";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import diyaImg from "/Image/Deepak-gif.gif";
import { strings, wishes } from "./data/wishes";

export default function App() {
  const [name, setName] = useState("");
  const [gateOpen, setGateOpen] = useState(true);
  const [currentWish, setCurrentWish] = useState("");
  const fwRef = useRef(null); // imperative control
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setName(storedName);
      setGateOpen(false); // auto-start if name is saved
    }
  }, []);

  const pickRandomWish = (person) => {
    const i = Math.floor(Math.random() * wishes.length);
    return wishes[i].text.replaceAll("{name}", person || "Friend");
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
    toast.success(strings.toastSuccess(trimmed), {
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
    <>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen bg-black/60 backdrop-blur">
        <div className="w-full overflow-y-auto max-h-screen px-4 py-6">
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
                  {strings.enterNamePrompt}
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
          <h1 className="">
            <img
              src={diyaImg}
              alt="Diya"
              className="mb-1 inline-block w-[200px] h-[200px] sm:w-[230px] sm:h-[230px]"
            />
            <p className="text-3xl sm:text-5xl md:text-7xl font-bold text-yellow-400 glow">
              {strings.greetingPrefix}
              {!gateOpen && `, ${name || "Friend"}`}
            </p>
          </h1>
          <p className="text-lg md:text-2xl text-orange-300 mt-4">
            {currentWish || "Type your name to get a crazy personalized wish!"}
          </p>

          {/* Controls */}
          <div className="mt-6 flex flex-wrap px-2 justify-center gap-3">
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
            <div className="mt-4 mb-12 sm:mb-6 flex justify-center gap-3">
              <button
                onClick={() => {
                  setGateOpen(true);
                }}
                className="px-4 py-2 text-sm rounded-lg border border-yellow-600 text-white hover:bg-yellow-700/20"
              >
                <FaRegEdit />
              </button>
              <button
                onClick={() => setShowDeleteConfirmModal(true)}
                className="px-4 py-2 text-sm rounded-lg border border-red-600 text-white hover:bg-red-700/20 flex items-center gap-2"
              >
                <RiDeleteBin5Line />
              </button>
            </div>
          )}

          <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-zinc-400">
            Credit: Rohitash Singh
          </p>

          <ToastContainer
            position="top-center"
            theme="colored"
            newestOnTop
            transition={Slide}
          />
        </div>
      </div>

      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="w-11/12 max-w-md rounded-2xl bg-zinc-900/80 border border-zinc-700 p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-red-400 text-center">
              Confirm Deletion
            </h2>
            <p className="text-sm text-zinc-300 text-center mt-2">
              Are you sure you want to delete your name?
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => {
                  localStorage.removeItem("userName");
                  setName("");
                  setGateOpen(true);
                  setShowDeleteConfirmModal(false);
                  toast.info("Name deleted.", {
                    position: "top-center",
                    theme: "colored",
                    transition: Slide,
                  });
                }}
                className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-5 py-2 rounded-lg border border-zinc-600 text-zinc-200 hover:bg-zinc-700/50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

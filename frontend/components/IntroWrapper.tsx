"use client";

import {
  useState, useEffect, useCallback, useRef, useMemo, startTransition,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const WORDS = [
    "Freshly Baked.",
    "Crafted with Passion.",
    "Traditional Recipes.",
    "Made for Every Moment."
];
const BG    = "#F4E8E3";
const CREAM = "#6B3F1F";
const GOLD = "#A5672D";

export default function IntroWrapper() {
  // true dari awal — overlay ada sejak render pertama (SSR maupun client)
  const [show,       setShow]       = useState(true);
  const [activeWord, setActiveWord] = useState(0);
  const [showLogo,   setShowLogo]   = useState(false);
  const [exiting,    setExiting]    = useState(false);

  const reducedMotion = useReducedMotion();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const dur = useMemo(() => ({
    word: 0.55, hold: 0.85, exit: 0.48, reduced: 0.1,
  }), []);

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const finish = useCallback(() => startTransition(() => setExiting(true)), []);

  // Lock scroll saat overlay aktif
  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  // Jalankan sequence animasi
  useEffect(() => {
    if (!show) return;
    clear();

    if (reducedMotion) {
      timers.current.push(setTimeout(finish, dur.reduced * 1000));
      return clear;
    }

    WORDS.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => startTransition(() => setActiveWord(i)), i * dur.word * 1000)
      );
    });
    timers.current.push(
      setTimeout(() => startTransition(() => setShowLogo(true)), WORDS.length * dur.word * 1000)
    );
    timers.current.push(
      setTimeout(finish, (WORDS.length * dur.word + dur.hold) * 1000)
    );

    return clear;
  }, [show, clear, dur, finish, reducedMotion]);

  const onExitDone = useCallback(() => {
    if (!exiting) return;
    clear();
    startTransition(() => {
      setShow(false);
      setExiting(false);
      setShowLogo(false);
      setActiveWord(0);
    });
  }, [clear, exiting]);

  // Tidak render apapun setelah selesai
  if (!show) return null;

  const wordV = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0,   transition: { duration: 0.22, ease: "easeOut"  as const } },
    exit:    { opacity: 0, y: -14, transition: { duration: 0.18, ease: "easeIn"   as const } },
  };

  return (
    <motion.div
      // suppressHydrationWarning: state awal (show=true) sama di server & client
      suppressHydrationWarning
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: BG,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      initial={false}
      animate={
        exiting
          ? { y: "-100%", opacity: 0, transition: { duration: dur.exit, ease: "easeInOut" } }
          : { y: "0%", opacity: 1 }
      }
      onAnimationComplete={onExitDone}
      role="status"
      aria-label="Memuat MyCakeShop"
    >
      {/* Glow blobs */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.07,
        backgroundImage: `radial-gradient(circle at 20% 30%,${GOLD},transparent 55%),
                          radial-gradient(circle at 80% 70%,${GOLD},transparent 55%)`,
      }} />

      <div style={{
        textAlign: "center", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 10, userSelect: "none",
      }}>
        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.22em",
            transition: { duration: 0.65, ease: "easeOut" } }}
          style={{
            color: CREAM,
            fontFamily: `"Playfair Display", serif`,
            fontSize: "clamp(28px,5vw,52px)",
            fontWeight: 800, lineHeight: 1.1,
          }}
        >
          MyCakeShop
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.45,
            transition: { duration: 0.5, delay: 0.2, ease: "easeOut" } }}
          style={{ width: 140, height: 1, background: GOLD, transformOrigin: "center" }}
        />

        {/* Cycling words */}
        <div style={{ position: "relative", height: 30, minWidth: 240 }}>
          <AnimatePresence mode="wait">
            {!showLogo && (
              <motion.div
                key={`w${activeWord}`}
                variants={wordV}
                initial="initial" animate="animate" exit="exit"
                style={{
                  position: "absolute", left: "50%", transform: "translateX(-50%)",
                  whiteSpace: "nowrap", color: CREAM, opacity: 0.7,
                  fontFamily: `"Inter",sans-serif`,
                  fontSize: "clamp(13px,2vw,17px)", letterSpacing: "0.1em",
                }}
              >
                {WORDS[activeWord]}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logo reveal */}
        <AnimatePresence>
          {showLogo && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as any } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              style={{
                marginTop: 6, width: 68, height: 68, borderRadius: "50%",
                border: `1.5px solid ${GOLD}`,
                boxShadow: `0 0 12px ${GOLD}55,inset 0 0 16px ${GOLD}33`,
                display: "grid", placeItems: "center", color: GOLD, fontSize: 26,
              }}
            >
              ✦
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

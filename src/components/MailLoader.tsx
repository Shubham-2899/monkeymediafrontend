import { CSSProperties, useEffect, useState } from "react";
import "./MailLoader.css";

const CYCLE_MS = 2400;
/** Point in the loop (fraction of a cycle) when the envelope closes and the badge ticks. */
const BADGE_TICK_AT = 0.76;

type MailLoaderProps = {
  /** Width/height of the animation in px. */
  size?: number;
  /** Text under the envelope. Pass an empty string to hide it. */
  label?: string;
  /**
   * - `inline`: just the animation (default)
   * - `block`: centred in a full-width padded box (for page sections)
   * - `overlay`: covers the nearest positioned parent with a blurred scrim
   * - `fullscreen`: covers the whole viewport
   */
  variant?: "inline" | "block" | "overlay" | "fullscreen";
  /** Text colour scheme for the label. Fullscreen/overlay default to dark. */
  tone?: "light" | "dark";
};

const MiniMail = () => (
  <svg viewBox="0 0 40 28" aria-hidden="true">
    <defs>
      <linearGradient id="ml-mini" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fffdf8" />
        <stop offset="1" stopColor="#f3eee4" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="38" height="26" rx="4" fill="url(#ml-mini)" stroke="#14213d" strokeWidth="1.6" />
    <path d="M2.5 3.5 L20 16 L37.5 3.5" fill="none" stroke="#c8553d" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

export default function MailLoader({
  size = 120,
  label = "Loading",
  variant = "inline",
  tone,
}: MailLoaderProps) {
  const [count, setCount] = useState(1);

  // Bump the unread badge each time the envelope "swallows" a batch.
  useEffect(() => {
    let interval: number | undefined;
    const first = window.setTimeout(() => {
      setCount((c) => c + 3);
      interval = window.setInterval(() => setCount((c) => (c >= 96 ? 1 : c + 3)), CYCLE_MS);
    }, CYCLE_MS * BADGE_TICK_AT);
    return () => {
      window.clearTimeout(first);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  const resolvedTone = tone ?? (variant === "fullscreen" || variant === "overlay" ? "dark" : "light");

  const loader = (
    <div
      className={`mail-loader${resolvedTone === "dark" ? " mail-loader--dark" : ""}`}
      style={{ "--ml-size": `${size}px` } as CSSProperties}
      role="status"
      aria-live="polite"
      aria-label={label || "Loading"}
    >
      <div className="ml-stage">
        <div className="ml-shadow" />
        <div className="ml-ripple" />
        <div className="ml-ripple ml-ripple--2" />

        <div className="ml-envelope">
          <div className="ml-env-tilt">
            <div className="ml-env-back" />
            <div className="ml-letter" />
            <svg className="ml-env-front" viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="ml-front" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fffdf8" />
                  <stop offset="1" stopColor="#f1ebe0" />
                </linearGradient>
                <linearGradient id="ml-side" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#f7f2e8" />
                  <stop offset="1" stopColor="#ece5d8" />
                </linearGradient>
              </defs>
              {/* side pockets */}
              <path d="M0 6 L44 40 L0 70 Z" fill="url(#ml-side)" />
              <path d="M100 6 L56 40 L100 70 Z" fill="url(#ml-side)" />
              {/* bottom pocket */}
              <path d="M0 70 L50 34 L100 70 Z" fill="url(#ml-front)" />
              <path d="M0 70 L50 34 L100 70" fill="none" stroke="#14213d" strokeOpacity="0.5" strokeWidth="1" />
            </svg>
            <div className="ml-flap">
              <svg viewBox="0 0 100 62" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="ml-flap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#1f2f55" />
                    <stop offset="1" stopColor="#14213d" />
                  </linearGradient>
                </defs>
                <path d="M2 0 H98 Q100 0 98.5 2 L54 58 Q50 62 46 58 L1.5 2 Q0 0 2 0 Z" fill="url(#ml-flap)" />
                <circle cx="50" cy="44" r="7" fill="#d6b27a" />
                <path d="M46.6 44 l2.4 2.4 4.4 -4.8" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div key={count} className="ml-badge is-pop">
            {count}
          </div>
        </div>

        <div className="ml-mail ml-mail--1">
          <MiniMail />
        </div>
        <div className="ml-mail ml-mail--2">
          <MiniMail />
        </div>
        <div className="ml-mail ml-mail--3">
          <MiniMail />
        </div>
      </div>

      {label && (
        <div className="ml-label">
          {label}
          <span className="ml-dots" aria-hidden="true">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      )}
    </div>
  );

  if (variant === "fullscreen") return <div className="mail-loader-fullscreen">{loader}</div>;
  if (variant === "overlay") return <div className="mail-loader-overlay">{loader}</div>;
  if (variant === "block") return <div className="mail-loader-block">{loader}</div>;
  return loader;
}

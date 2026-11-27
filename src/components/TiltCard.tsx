import { ReactNode, useRef } from "react";
import { Link } from "react-router-dom";

type TiltCardProps = {
  to: string;
  icon: ReactNode;
  title: string;
  text: string;
  accent: string;
  delay?: number;
  cta?: string;
};

/** Glass card that tilts toward the cursor in 3D, with a moving glare. */
export default function TiltCard({ to, icon, title, text, accent, delay = 0, cta = "Open" }: TiltCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 16}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 18}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <Link
      ref={ref}
      to={to}
      className="tilt-card"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ "--accent": accent, animationDelay: `${delay}ms` } as React.CSSProperties}
    >
      <span className="tilt-card__glare" />
      <span className="tilt-card__icon">{icon}</span>
      <span className="tilt-card__title">{title}</span>
      <span className="tilt-card__text">{text}</span>
      <span className="tilt-card__go">
        {cta}
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}

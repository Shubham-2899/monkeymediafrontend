import { CSSProperties, FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { paperTheme } from "../theme/paperTheme";
import { CONTACT, FOOTER } from "./content";
import "./site.css";

/** Wraps every public page: paper theme, page background, footer. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={paperTheme}>
      <div className="site">
        <main>{children}</main>
        <SiteFooter />
      </div>
    </ThemeProvider>
  );
}

/** Fades children in the first time they scroll into view (or are scrolled past). */
export function Reveal({
  children,
  delay = 0,
  className = "",
  style,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "article" | "figure" | "li";
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`reveal${shown ? " is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}

/** Header block for inner pages: a small index label, a big serif title, optional lead. */
export function PageHead({ index, label, title, lead }: { index: string; label: string; title: ReactNode; lead?: string }) {
  return (
    <header className="page-head">
      <div className="wrap">
        <div className="label hero-in">
          {index} — {label}
        </div>
        <h1 className="display hero-in" style={{ animationDelay: "60ms" }}>
          {title}
        </h1>
        {lead && (
          <p className="lead hero-in" style={{ animationDelay: "120ms" }}>
            {lead}
          </p>
        )}
      </div>
    </header>
  );
}

export function ArrowIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}

function SiteFooter() {
  const [email, setEmail] = useState("");

  // No newsletter backend exists yet, so this opens a pre-filled email to the team.
  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("Newsletter subscription");
    const body = encodeURIComponent(`Please add ${email} to the RASPIX Media newsletter.`);
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
  };

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-cta">
          <div className="label">Write to us</div>
          <a className="big" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
        </div>

        <div className="footer-grid">
          <div>
            <h4>RASPIX Media</h4>
            <p style={{ margin: 0, maxWidth: 340 }}>{FOOTER.blurb}</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              {FOOTER.quickLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </li>
              <li>{CONTACT.location}</li>
              <li>
                <a href={CONTACT.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn ↗
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4>{FOOTER.newsletterTitle}</h4>
            <p style={{ margin: "0 0 14px" }}>{FOOTER.newsletterText}</p>
            <form className="newsletter" onSubmit={subscribe}>
              <input
                type="email"
                required
                placeholder="you@company.com"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit">Subscribe →</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <span>{FOOTER.copyright}</span>
          <span>{CONTACT.location}</span>
        </div>
      </div>
    </footer>
  );
}

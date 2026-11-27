import { Link } from "react-router-dom";
import SceneBackdrop from "../../components/three/SceneBackdrop";
import { ArrowIcon, Reveal, SiteShell } from "../SiteParts";
import { HOME, SOLUTIONS } from "../content";

export default function SiteHome() {
  return (
    <SiteShell>
      {/* ---------- hero: copy left, globe with mail envelopes right (same as sign-in) ---------- */}
      <section className="hero">
        <SceneBackdrop variant="hero" />
        {/* keeps the copy readable where the globe passes behind it on small screens */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background: "linear-gradient(90deg, rgba(245,241,234,0.96) 0%, rgba(245,241,234,0.75) 40%, rgba(245,241,234,0) 62%)",
          }}
        />
        <div className="wrap">
          <div className="hero__copy">
            <div className="hero__meta label hero-in">{HOME.eyebrow}</div>
            <h1 className="display hero-in" style={{ animationDelay: "60ms" }}>
              {HOME.title[0]} <em>{HOME.title[1]}</em>
            </h1>
            <p className="lead hero-in" style={{ animationDelay: "120ms" }}>
              {HOME.subtitle}
            </p>
            <div className="hero__actions hero-in" style={{ animationDelay: "180ms" }}>
              <Link to="/contact-us" className="btn btn--ink">
                {HOME.cta} <ArrowIcon />
              </Link>
              <Link to="/services" className="btn btn--ghost">
                Our Services
              </Link>
            </div>
          </div>
        </div>
        <div className="postmark" aria-hidden="true">
          <div>
            RASPIX
            <strong>Pune</strong>
            Maharashtra
          </div>
        </div>
      </section>


      {/* ---------- why choose ---------- */}
      <section className="section">
        <div className="wrap split">
          <Reveal>
            <div className="label">01 — {HOME.why.eyebrow}</div>
          </Reveal>
          <div>
            <Reveal>
              <h2 className="h2" style={{ maxWidth: "16em" }}>
                {HOME.why.title}
              </h2>
              <p className="lead" style={{ marginTop: 22 }}>
                {HOME.why.text}
              </p>
            </Reveal>
            <div className="rows" style={{ marginTop: 56 }}>
              {HOME.why.points.map((pt, i) => (
                <Reveal key={pt.title} className="row" delay={i * 60}>
                  <span className="row__num">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="h3">{pt.title}</h3>
                  <p className="body">{pt.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- solutions ---------- */}
      <section className="section section--alt">
        <div className="wrap">
          <div className="split" style={{ marginBottom: 56 }}>
            <Reveal>
              <div className="label">02 — {HOME.solutions.eyebrow}</div>
            </Reveal>
            <Reveal>
              <h2 className="h2" style={{ maxWidth: "15em" }}>
                {HOME.solutions.title}
              </h2>
            </Reveal>
          </div>
          <div className="ruled">
            {SOLUTIONS.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <div className="label label--stamp">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="h3" style={{ marginTop: 14 }}>
                  {s.title}
                </h3>
                <p className="body">{s.text}</p>
                <Link to="/services#email-marketing" className="more">
                  Learn More <ArrowIcon size={14} />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

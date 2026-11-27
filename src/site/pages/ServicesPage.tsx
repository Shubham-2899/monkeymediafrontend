import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PageHead, Reveal, SiteShell } from "../SiteParts";
import { SERVICE_GROUPS, SERVICES_TITLE, SOLUTIONS } from "../content";

const pad = (n: number) => String(n).padStart(2, "0");

export default function ServicesPage() {
  const { hash } = useLocation();
  const [active, setActive] = useState(SERVICE_GROUPS[0].id);

  // Honour deep links such as /services#email-marketing.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }, [hash]);

  // Highlight the group currently on screen in the index.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    SERVICE_GROUPS.forEach((g) => {
      const el = document.getElementById(g.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <SiteShell>
      <PageHead index="02" label="Services" title={SERVICES_TITLE} />

      {/* headline solutions */}
      <section className="section--tight" style={{ padding: "0 0 24px" }}>
        <div className="wrap">
          <div className="ruled" style={{ borderTop: 0 }}>
            {SOLUTIONS.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <h3 className="h3" style={{ marginTop: 8 }}>
                  {s.title}
                </h3>
                <p className="body">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="wrap svc">
          <nav className="svc-index" aria-label="Service categories">
            {SERVICE_GROUPS.map((g, i) => (
              <a key={g.id} href={`#${g.id}`} className={active === g.id ? "is-active" : ""}>
                <span>{pad(i + 1)}</span>
                {g.title}
              </a>
            ))}
          </nav>

          <div>
            {SERVICE_GROUPS.map((g, gi) => (
              <section key={g.id} id={g.id} className="svc-group">
                <header>
                  <span className="label label--stamp">{pad(gi + 1)}</span>
                  <h2 className="h2" style={{ fontSize: "clamp(1.7rem, 2.6vw, 2.3rem)" }}>
                    {g.title}
                  </h2>
                </header>
                <div className="rows">
                  {g.items.map((it) => (
                    <Reveal key={it.title} className="row">
                      <h3 className="h3" style={{ fontSize: 20 }}>
                        {it.title}
                      </h3>
                      <p className="body">{it.text}</p>
                    </Reveal>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

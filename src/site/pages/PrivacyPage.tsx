import { Fragment, ReactNode, useEffect, useState } from "react";
import { PageHead, SiteShell } from "../SiteParts";
import { PolicyBlock, PRIVACY, PRIVACY_SECTIONS } from "../privacy";

const pad = (n: number) => String(n).padStart(2, "0");

/** Turns email addresses in policy text into mailto links. */
function linkify(text: string): ReactNode {
  const parts = text.split(/([\w.+-]+@[\w-]+\.[\w.]+)/g);
  return parts.map((part, i) =>
    /^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part) ? (
      <a key={i} href={`mailto:${part}`} className="inline-link">
        {part}
      </a>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

function Block({ block }: { block: PolicyBlock }) {
  if (typeof block === "string") return <p>{linkify(block)}</p>;
  if ("sub" in block) return <h3>{block.sub}</h3>;
  return (
    <ul>
      {block.list.map((item) => (
        <li key={item.slice(0, 40)}>{linkify(item)}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  const [active, setActive] = useState(PRIVACY_SECTIONS[0].id);

  // Highlight the section currently being read in the index.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    PRIVACY_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <SiteShell>
      <PageHead index="05" label={PRIVACY.updated} title={PRIVACY.title} lead={PRIVACY.lead} />

      <section className="section" style={{ paddingTop: 72 }}>
        <div className="wrap svc">
          <nav className="svc-index" aria-label="Privacy policy sections">
            {PRIVACY_SECTIONS.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className={active === s.id ? "is-active" : ""}>
                <span>{pad(i + 1)}</span>
                {s.title}
              </a>
            ))}
          </nav>

          <article className="prose policy">
            {PRIVACY_SECTIONS.map((s, i) => (
              <section key={s.id} id={s.id}>
                <h2>
                  <span className="label label--stamp">{pad(i + 1)}</span>
                  {s.title}
                </h2>
                {s.body.map((b, j) => (
                  <Block key={j} block={b} />
                ))}
              </section>
            ))}
          </article>
        </div>
      </section>
    </SiteShell>
  );
}

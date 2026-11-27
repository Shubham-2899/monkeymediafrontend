import { PageHead, Reveal, SiteShell } from "../SiteParts";
import { ABOUT } from "../content";

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHead index="01" label="About Us" title={ABOUT.title} lead={ABOUT.subtitle} />

      {/* story */}
      <section className="section">
        <div className="wrap split">
          <div className="label">{ABOUT.storyTitle}</div>
          <Reveal>
            <p className="lead dropcap" style={{ maxWidth: "36em" }}>
              {ABOUT.story[0]}
            </p>
            <p className="lead" style={{ maxWidth: "36em", marginTop: 24 }}>
              {ABOUT.story[1]}
            </p>
          </Reveal>
        </div>
      </section>

      {/* values */}
      <section className="section section--alt">
        <div className="wrap">
          <div className="split" style={{ marginBottom: 48 }}>
            <div className="label">Values</div>
            <h2 className="h2">{ABOUT.valuesTitle}</h2>
          </div>
          <div className="ruled">
            {ABOUT.values.map((v, i) => (
              <Reveal key={v.title} delay={i * 60}>
                <div className="label label--stamp">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="h3" style={{ marginTop: 14 }}>
                  {v.title}
                </h3>
                <p className="body">{v.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* team */}
      <section className="section">
        <div className="wrap">
          <div className="split" style={{ marginBottom: 48 }}>
            <div className="label">People</div>
            <h2 className="h2">{ABOUT.teamTitle}</h2>
          </div>
          <div className="ruled">
            {ABOUT.team.map((m, i) => (
              <Reveal key={m.name} delay={i * 60}>
                <div className="monogram">{m.initials}</div>
                <h3 className="h3">{m.name}</h3>
                <div className="role">{m.role}</div>
                <p className="body" style={{ marginTop: 14 }}>
                  {m.bio}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

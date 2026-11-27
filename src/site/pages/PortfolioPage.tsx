import { PageHead, Reveal, SiteShell } from "../SiteParts";
import { PORTFOLIO, PORTFOLIO_TITLE } from "../content";

export default function PortfolioPage() {
  return (
    <SiteShell>
      <PageHead index="04" label="Portfolio" title={PORTFOLIO_TITLE} />
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="wrap">
          {PORTFOLIO.map((p, i) => (
            <Reveal key={p.title} as="article" className="case">
              <div className="case__num">{String(i + 1).padStart(2, "0")}</div>
              <div>
                <h2 className="h2" style={{ fontSize: "clamp(1.7rem, 2.6vw, 2.2rem)" }}>
                  {p.title}
                </h2>
                <p className="lead" style={{ marginTop: 14 }}>
                  {p.text}
                </p>
              </div>
              <div className="result-stamp">
                <span className="label">Result</span>
                <p>{p.result}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

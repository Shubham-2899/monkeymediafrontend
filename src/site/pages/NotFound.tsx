import { Link } from "react-router-dom";
import { ArrowIcon, SiteShell } from "../SiteParts";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="notfound">
        <div className="wrap">
          <div className="label label--stamp">404 — Return to sender</div>
          <h1 className="display" style={{ marginTop: 18 }}>
            This page <em>bounced.</em>
          </h1>
          <p className="lead" style={{ marginTop: 22 }}>
            The page you were looking for doesn&apos;t exist or has moved.
          </p>
          <div style={{ marginTop: 36 }}>
            <Link to="/" className="btn btn--ink">
              Back to home <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

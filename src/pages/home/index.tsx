import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Link } from "react-router-dom";
import ForwardToInboxOutlinedIcon from "@mui/icons-material/ForwardToInboxOutlined";
import AddLinkRoundedIcon from "@mui/icons-material/AddLinkRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import { useUserAuth } from "../../contexts/UserAuthContext";
import SceneBackdrop from "../../components/three/SceneBackdrop";
import TiltCard from "../../components/TiltCard";
import { ArrowIcon } from "../../site/SiteParts";
import { paperTheme } from "../../theme/paperTheme";

/** Portal dashboard (signed-in users). */
const Home = () => {
  const { user, isAdmin } = useUserAuth();
  const name = user?.displayName || user?.email?.split("@")[0] || "there";

  const cards = [
    {
      to: "/mailing",
      icon: <ForwardToInboxOutlinedIcon />,
      title: "Mailing",
      text: "Compose, test and launch bulk campaigns across your sending domains.",
      accent: "#14213d",
    },
    {
      to: "/create-link",
      icon: <AddLinkRoundedIcon />,
      title: "Create link",
      text: "Generate tracked links so every open and click is attributed.",
      accent: "#1f4e8c",
    },
    {
      to: "/analytics",
      icon: <QueryStatsRoundedIcon />,
      title: "Analytics",
      text: "Follow opens, clicks and bounces for each campaign as they happen.",
      accent: "#c8553d",
    },
    {
      to: "/report",
      icon: <AssessmentOutlinedIcon />,
      title: "Report",
      text: "Pull delivery reports and export results for your team.",
      accent: "#14213d",
    },
    ...(isAdmin
      ? [
          {
            to: "/admin",
            icon: <AdminPanelSettingsOutlinedIcon />,
            title: "Admin",
            text: "Manage users, server domains, suppression lists and queues.",
            accent: "#1f4e8c",
          },
        ]
      : []),
  ];

  return (
    <ThemeProvider theme={paperTheme}>
      {/* reuses the public-site type and layout classes */}
      <div className="site">
        <section className="hero" style={{ minHeight: "calc(100vh - 76px)" }}>
          <SceneBackdrop variant="hero" />
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
              <div className="hero__meta label hero-in">Welcome back, {name}</div>
              <h1 className="display hero-in" style={{ animationDelay: "60ms" }}>
                Ready for <em>today&apos;s send?</em>
              </h1>
              <p className="lead hero-in" style={{ animationDelay: "120ms" }}>
                Launch a campaign, create tracked links, and follow every open and click.
              </p>
              <div className="hero__actions hero-in" style={{ animationDelay: "180ms" }}>
                <Link to="/mailing" className="btn btn--ink">
                  Launch a campaign <ArrowIcon />
                </Link>
                <Link to="/analytics" className="btn btn--ghost">
                  View analytics
                </Link>
              </div>
            </div>
          </div>
        </section>


        <section className="section section--tight">
          <div className="wrap">
            <div className="label" style={{ marginBottom: 28 }}>
              Tools
            </div>
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: `repeat(${cards.length}, 1fr)` },
                perspective: "1200px",
              }}
            >
              {cards.map((c, i) => (
                <TiltCard key={c.to} {...c} delay={i * 60} />
              ))}
            </Box>
          </div>
        </section>
      </div>
    </ThemeProvider>
  );
};

export default Home;

import React from "react";
import { Link, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Button from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";
import raspix from "../assets/raspix-logo.png";
import { useAuth } from "../contexts/UserAuthContext";
import { SITE_NAV } from "../site/content";

const shimmerStyle = {
  background: "linear-gradient(90deg, rgba(20,33,61,0.05) 25%, rgba(20,33,61,0.1) 50%, rgba(20,33,61,0.05) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: 2,
  width: 90,
  height: 32,
};

const PORTAL_PAGES = [
  { label: "Home", to: "/home" },
  { label: "Create link", to: "/create-link" },
  { label: "Mailing", to: "/mailing" },
  { label: "Analytics", to: "/analytics" },
  { label: "Report", to: "/report" },
];

const PORTAL_PREFIXES = ["/home", "/create-link", "/mailing", "/analytics", "/report", "/admin"];

const navLinkSx = (active: boolean, mobile = false): SxProps<Theme> => ({
  position: "relative",
  color: active ? "#14213d" : "#3d4a63",
  background: "transparent",
  borderRadius: 0,
  fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
  px: 1.75,
  py: 1,
  minWidth: 0,
  textTransform: "none",
  transition: "color .2s, background .2s",
  ...(mobile && { justifyContent: "flex-start", py: 1.4 }),
  "&::after": {
    display: mobile ? "none" : "block",
    content: '""',
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 6,
    height: 1.5,
    background: "#c8553d",
    transform: active ? "scaleX(1)" : "scaleX(0)",
    transition: "transform .3s cubic-bezier(.2,.8,.2,1)",
  },
  "&:hover": { color: "#14213d", background: "transparent" },
  "&:hover::after": { transform: "scaleX(1)" },
});

const softButtonSx: SxProps<Theme> = {
  color: "#14213d",
  fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
  fontWeight: 600,
  fontSize: 15,
  textTransform: "none",
  px: 2.25,
  py: 0.8,
  borderRadius: 0,
  border: "1px solid #14213d",
  background: "transparent",
  "&:hover": { background: "#14213d", color: "#f5f1ea" },
};

function ResponsiveAppBar() {
  const [openNav, setOpenNav] = React.useState(false);
  const location = useLocation();
  const { login, logOut, setLogin, isAdmin, loading } = useAuth();

  const path = location.pathname;
  const inPortal = PORTAL_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
  const onAuthPage = path === "/signin" || path === "/forgot-password";
  const alignToPage = !inPortal || path === "/home";

  const handleMenuItemClick = () => setOpenNav(false);

  const handleLogOut = async () => {
    try {
      await logOut();
      sessionStorage.removeItem("authToken");
      setLogin(false);
      setOpenNav(false);
    } catch (error) {
      console.log(error);
    }
  };

  // Public website pages show the site menu; the portal shows its own tools.
  const items = inPortal ? [...PORTAL_PAGES, ...(isAdmin ? [{ label: "Admin", to: "/admin" }] : [])] : SITE_NAV;
  const isActive = (to: string) => (to === "/admin" ? path.startsWith("/admin") : path === to);

  const rightAction = inPortal ? (
    <Button
      onClick={handleLogOut}
      startIcon={<LogoutRoundedIcon />}
      sx={{
        px: 2,
        py: 0.9,
        color: "#c8553d",
        fontWeight: 600,
        fontSize: 15,
        textTransform: "none",
        borderRadius: 0,
        border: "1px solid rgba(200,85,61,0.5)",
        "&:hover": { background: "rgba(200,85,61,0.08)", borderColor: "#c8553d" },
      }}
    >
      Logout
    </Button>
  ) : login ? (
    <Button component={Link} to="/home" onClick={handleMenuItemClick} startIcon={<DashboardRoundedIcon />} sx={softButtonSx}>
      Open Portal
    </Button>
  ) : onAuthPage ? null : (
    <Button component={Link} to="/signin" onClick={handleMenuItemClick} startIcon={<LoginRoundedIcon />} sx={softButtonSx}>
      Client Login
    </Button>
  );

  // Inside the portal, wait for auth before drawing the menu (avoids a flash).
  const showSkeleton = inPortal && loading;

  return (
    <Box component="header" sx={{ position: "sticky", top: 0, zIndex: 9900 }}>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          background: "#f5f1ea",
          color: "#14213d",
          fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {/* Website pages: same centred 1200px column + 28px gutters as the page content (.wrap),
            so the logo and the last button line up with the content edges.
            Portal tool pages keep a full-width bar (some have their own side drawer). */}
        <Toolbar
          disableGutters
          sx={{
            minHeight: 76,
            width: "100%",
            boxSizing: "border-box",
            ...(alignToPage ? { maxWidth: 1200, mx: "auto", px: "28px" } : { px: { xs: 1.5, sm: 3 } }),
          }}
        >
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <Link to={inPortal ? "/home" : "/"} style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              {/* multiply blends the logo's white background into the paper */}
              <img src={raspix} alt="RASPIX Media" style={{ maxWidth: 118, display: "block", mixBlendMode: "multiply" }} />
            </Link>
          </Box>

          {showSkeleton ? (
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, alignItems: "center" }}>
              {[...Array(4)].map((_, i) => (
                <Box key={i} sx={shimmerStyle} />
              ))}
            </Box>
          ) : (
            <>
              {/* ---------- mobile ---------- */}
              <Box sx={{ display: { xs: "flex", md: "none" } }}>
                <IconButton
                  size="large"
                  aria-label="Open navigation"
                  aria-expanded={openNav}
                  onClick={() => setOpenNav(!openNav)}
                  sx={{
                    color: "#14213d",
                    border: "1px solid #14213d",
                    borderRadius: 0,
                    p: 0.75,
                    background: openNav ? "rgba(20,33,61,0.06)" : "transparent",
                  }}
                >
                  {openNav ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
                </IconButton>
                {openNav && (
                  <Box
                    component="nav"
                    sx={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 76,
                      display: "flex",
                      flexDirection: "column",
                      p: 1.5,
                      gap: 0.5,
                      background: "#f5f1ea",
                      borderBottom: "1px solid #14213d",
                      animation: "hero-in .35s cubic-bezier(.2,.8,.2,1) both",
                    }}
                  >
                    {items.map((item) => (
                      <Button key={item.to} component={Link} to={item.to} onClick={handleMenuItemClick} sx={navLinkSx(isActive(item.to), true)}>
                        <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{item.label}</Typography>
                      </Button>
                    ))}
                    {rightAction && <Box sx={{ pt: 1, px: 1 }}>{rightAction}</Box>}
                  </Box>
                )}
              </Box>

              {/* ---------- desktop ---------- */}
              {/* with no button at the end, offset the last link's padding so its text meets the page edge */}
              <Box component="nav" sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5, mr: rightAction ? 0 : -1.75 }}>
                {items.map((item) => (
                  <Button key={item.to} component={Link} to={item.to} onClick={handleMenuItemClick} sx={navLinkSx(isActive(item.to))}>
                    <Typography sx={{ fontWeight: 600, fontSize: 15, letterSpacing: 0.1 }}>{item.label}</Typography>
                  </Button>
                ))}
                {rightAction && <Box sx={{ ml: 1.5 }}>{rightAction}</Box>}
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default ResponsiveAppBar;

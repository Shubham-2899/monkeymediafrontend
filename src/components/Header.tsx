import React from "react";
import { Link, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
// import mms from "../assets/mms.jpeg";
import raspix from "../assets/raspix-logo.png";
import { useAuth } from "../contexts/UserAuthContext";

const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  height: "40px",
  width: "150px",
  borderRadius: "5px",
};

const pages = ["Home", "Create link", "Mailing", "Analytics", "Report"];

function ResponsiveAppBar() {
  const [openNav, setOpenNav] = React.useState(false);
  const location = useLocation();
  const { login, logOut, setLogin, isAdmin, loading } = useAuth();

  const handleOpenNavMenu = () => {
    setOpenNav(!openNav);
  };

  const handleMenuItemClick = () => {
    setOpenNav(false); // Close the navigation menu after navigation
  };

  const handleLogOut = async () => {
    try {
      await logOut();
      sessionStorage.removeItem("authToken");
      setLogin(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getPagePath = (page: string) => {
    switch (page) {
      case "Home":
        return "/home";
      case "Create link":
        return "/create-link";
      case "Mailing":
        return "/mailing";
      case "Analytics":
        return "/analytics";
      case "Report":
        return "/report";
      default:
        return `/${page.toLowerCase().replace(" ", "-")}`;
    }
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 0, position: 'sticky', top: 0, zIndex: 9900 }}>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #e0e0e0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
        }}
      >
        <Toolbar disableGutters sx={{ minHeight: 76, px: { xs: 1, sm: 3 } }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Link style={{ textDecoration: "none", color: "#1976d2", display: 'flex', alignItems: 'center' }} to={`/home`}>
              <img
                src={raspix}
                alt="monkey media email marketing"
                style={{
                  objectFit: "cover",
                  maxWidth: "140px",
                  margin: "5px 0",
                  borderRadius: 6,
                  // boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              />
              {/* <Typography variant="h6" sx={{ ml: 1, fontWeight: 700, color: '#1976d2', display: { xs: 'none', sm: 'block' } }}>
                Monkey Media
              </Typography> */}
            </Link>
          </Box>
          {loading ? (
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, alignItems: 'center' }}>
            {[...Array(4)].map((_, i) => (
              <Box key={i} sx={{ ...shimmerStyle, borderRadius: 2, width: 90, height: 32 }} />
            ))}
          </Box>
        ) : login ? (
          <>
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                marginRight: 2,
                backgroundColor: openNav ? "#f5f6fa" : "#fff",
                boxShadow: openNav ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                transition: 'background 0.2s',
              }}
            >
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
                sx={{
                  padding: "5px",
                }}
                disableRipple={true}
              >
                <MenuRoundedIcon sx={{ color: "#888" }} />
              </IconButton>
              {openNav && (
                <nav
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100vw",
                    left: 0,
                    top: 64,
                    position: "absolute",
                    color: "#1976d2",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    zIndex: 1201,
                  }}
                >
                  {pages.map((page) => {
                    const to = getPagePath(page);
                    return (
                      <Link
                        key={page}
                        onClick={handleMenuItemClick}
                        style={{
                          padding: '12px 18px',
                          textDecoration: "none",
                          color: location.pathname === to ? "#1976d2" : "#555",
                          background: location.pathname === to ? "#e3f2fd" : "transparent",
                          fontWeight: location.pathname === to ? 700 : 500,
                          borderLeft: location.pathname === to ? '4px solid #1976d2' : '4px solid transparent',
                          transition: 'all 0.2s',
                        }}
                        to={to}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, letterSpacing: 0.2 }}
                        >
                          {page}
                        </Typography>
                      </Link>
                    );
                  })}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={handleMenuItemClick}
                      style={{
                        padding: '12px 18px',
                        textDecoration: "none",
                        color: "#777",
                        backgroundColor: location.pathname?.includes("admin")
                          ? "#00acef"
                          : "transparent",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, letterSpacing: 0.2 }}
                      >
                        Admin
                      </Typography>
                    </Link>
                  )}
                  <Button
                    onClick={handleLogOut}
                    sx={{
                      padding: '12px 18px',
                      color: '#d32f2f',
                      fontWeight: 600,
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      fontSize: 16,
                    }}
                  >
                    Logout
                  </Button>
                </nav>
              )}
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                display: {
                  xs: "none",
                  md: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  pr: 4,
                },
                alignItems: 'center',
              }}
            >
              {pages.map((page) => {
                const to = getPagePath(page);
                return (
                  <Button
                    key={page}
                    component={Link}
                    to={to}
                    sx={{
                      color:  location.pathname === to ? "#1976d2" : "#555",
                      background:  "transparent",
                      fontWeight:   500,
                      borderRadius: 2,
                      px: 2.5,
                      py: 1.2,
                      minWidth: 90,
                      boxShadow: location.pathname === to ? '0 2px 8px rgba(25,118,210,0.04)' : 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: '#e3f2fd',
                        color: '#1976d2',
                      },
                    }}
                    onClick={handleMenuItemClick}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, letterSpacing: 0.2 }}>
                      {page}
                    </Typography>
                  </Button>
                );
              })}
              {isAdmin && (
                <Button
                  component={Link}
                  to="/admin"
                  sx={{
                    my: 2,
                    color: location.pathname?.includes("admin")
                      ? "#00acef"
                      : "#777",
                    display: "block",
                  }}
                  onClick={handleMenuItemClick}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, letterSpacing: 0.2 }}>
                    Admin
                  </Typography>
                </Button>
              )}
              <Button
                onClick={handleLogOut}
                sx={{
                  color: '#d32f2f',
                  fontWeight: 600,
                  fontSize: 16,
                  px: 2.5,
                  py: 1.2,
                  borderRadius: 2,
                  ml: 1,
                  '&:hover': {
                    background: '#ffebee',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </>
        ) : (
          <Button
            component={Link}
            to="/signin"
            sx={{
              color: '#1976d2',
              fontWeight: 700,
              fontSize: 16,
              px: 2.5,
              py: 1.2,
              borderRadius: 2,
              mr: 2,
              '&:hover': {
                background: '#e3f2fd',
              },
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Sign In
            </Typography>
          </Button>
        )}
        </Toolbar>
      </AppBar>
    </Paper>
  );
}

export default ResponsiveAppBar;

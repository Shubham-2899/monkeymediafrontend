import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import Button from "@mui/material/Button";
import mms from "../assets/mms.jpeg";
import { useAuth } from "../contexts/UserAuthContext";

const pages = ["Home", "Create link", "Mailing", "Report"];

function ResponsiveAppBar() {
  const [openNav, setOpenNav] = React.useState(false);
  const location = useLocation();
  const { login, logOut, setLogin, isAdmin } = useAuth();

  const handleOpenNavMenu = (_event: React.MouseEvent<HTMLElement>) => {
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

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{ borderBottom: "1px solid #ddd", backgroundColor: "#fff" }}
    >
      <Toolbar disableGutters>
        <div style={{ flexGrow: 1 }}>
          <Link style={{ textDecoration: "none", color: "#777" }} to={`/home`}>
            <img
              src={mms}
              alt="monkey media email marketing"
              style={{
                objectFit: "cover",
                maxWidth: "150px",
                margin: "5px",
              }}
            />
          </Link>
        </div>
        {!login ? (
          <>
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                border: "1px solid #ddd",
                borderRadius: "5px",
                marginRight: "10px",
                "&:hover": {
                  backgroundColor: "#ddd",
                },
                backgroundColor: openNav ? "#ddd" : "transparent",
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
                    width: "100%",
                    top: "57px",
                    left: 0,
                    position: "absolute",
                    color: "#777",
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 0 #888",
                    zIndex: 9,
                  }}
                >
                  {pages.map((page) => {
                    const to = `/${page.toLowerCase().replace(" ", "-")}`;
                    return (
                      <Link
                        key={page}
                        onClick={handleMenuItemClick}
                        style={{
                          paddingLeft: "10px",
                          textDecoration: "none",
                          color: "#777",
                          backgroundColor:
                            location.pathname === to
                              ? "#00acef"
                              : "transparent",
                        }}
                        to={to}
                      >
                        <Typography
                          variant="h6"
                          style={{ textDecoration: "none", color: "#777" }}
                        >
                          {page}
                        </Typography>
                      </Link>
                    );
                  })}
                  {/* Conditionally render Admin option for mobile view */}
                  {isAdmin && (
                    <Link
                      to="/admin/users"
                      onClick={handleMenuItemClick}
                      style={{
                        paddingLeft: "10px",
                        textDecoration: "none",
                        color: "#777",
                        backgroundColor:
                          location.pathname === "/admin/users"
                            ? "#00acef"
                            : "transparent",
                      }}
                    >
                      <Typography
                        variant="h6"
                        style={{ textDecoration: "none", color: "#777" }}
                      >
                        Admin
                      </Typography>
                    </Link>
                  )}
                  <Button
                    onClick={handleLogOut}
                    sx={{ paddingLeft: "10px", color: "#777" }}
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
                  justifyContent: "end",
                  gap: "25px",
                  paddingRight: "30px",
                },
              }}
            >
              {pages.map((page) => {
                const to = `/${page.toLowerCase().replace(" ", "-")}`;
                return (
                  <Button
                    key={page}
                    component={Link}
                    to={to}
                    sx={{
                      my: 2,
                      color: location.pathname === to ? "#00acef" : "#777",
                      display: "block",
                    }}
                    onClick={handleMenuItemClick}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "500" }}>
                      {page}
                    </Typography>
                  </Button>
                );
              })}
              {/* Conditionally render Admin option for desktop view */}
              {isAdmin && (
                <Button
                  component={Link}
                  to="/admin/users"
                  sx={{
                    my: 2,
                    color:
                      location.pathname === "/admin/users" ? "#00acef" : "#777",
                    display: "block",
                  }}
                  onClick={handleMenuItemClick}
                >
                  <Typography variant="h6" sx={{ fontWeight: "500" }}>
                    Admin
                  </Typography>
                </Button>
              )}
              <Button
                onClick={handleLogOut}
                sx={{ color: "#777", fontSize: "20px" }}
              >
                Logout
              </Button>
            </Box>
          </>
        ) : (
          <Button
            component={Link}
            to="/signin"
            sx={{ my: 2, mr: 2, color: "#777", display: "block" }}
          >
            <Typography variant="h6" sx={{ fontWeight: "500" }}>
              Sign In
            </Typography>
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default ResponsiveAppBar;

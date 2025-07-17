import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import PeopleIcon from "@mui/icons-material/People";
import MailIcon from "@mui/icons-material/Mail";
import QueueIcon from "@mui/icons-material/Queue";
import BlockIcon from "@mui/icons-material/Block";
import CampaignIcon from "@mui/icons-material/Campaign";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import Users from "./pages/users/Users";
import AddEmails from "./pages/add-emails";
import BullMQDashboard from "../bullmq-dashboard";
import Suppression from "./pages/suppression";
import EmailAnalytics from "../../components/EmailAnalytics";

const drawerWidth = 240;

const componentMap = {
  Users: <Users />,
  "Add Email List": <AddEmails />,
  "View Queue": <BullMQDashboard />,
  Suppression: <Suppression />,
  Analytics: <EmailAnalytics />,
};

type ComponentKey = keyof typeof componentMap;

const getIcon = (componentName: string) => {
  switch (componentName) {
    case "Users":
      return <PeopleIcon />;
    case "Add Email List":
      return <MailIcon />;
    case "View Queue":
      return <QueueIcon />;
    case "Suppression":
      return <BlockIcon />;
    case "Campaigns":
      return <CampaignIcon />;
    case "Analytics":
      return <AnalyticsIcon />;
    default:
      return <InboxIcon />;
  }
};

export default function Admin() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentKey>(
    () => {
      // Restore from sessionStorage or default to Users
      const saved = sessionStorage.getItem("admin_selected_component");
      return saved && Object.keys(componentMap).includes(saved)
        ? (saved as ComponentKey)
        : "Users";
    }
  );

  useEffect(() => {
    sessionStorage.setItem("admin_selected_component", selectedComponent);
  }, [selectedComponent]);

  // Only show sidebar if there are multiple components
  const showSidebar = Object.keys(componentMap).length > 1;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#fafafa" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "#ffffff",
          color: "#1976d2",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          borderBottom: "1px solid #e0e0e0",
        }}
        elevation={0}
      >
        <Toolbar>
          <Typography
            variant="h5"
            noWrap
            sx={{ fontWeight: 600, color: "#1976d2" }}
          >
            Admin Panel
          </Typography>
          <Typography
            variant="h6"
            sx={{ ml: 3, color: "#666", fontWeight: 400 }}
          >
            {selectedComponent}
          </Typography>
        </Toolbar>
      </AppBar>

      {showSidebar && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              background: "#ffffff",
              color: "#333",
              borderRight: "1px solid #e0e0e0",
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: "auto", mt: 1 }}>
            <List>
              {(Object.keys(componentMap) as ComponentKey[]).map((text) => (
                <ListItem key={text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={selectedComponent === text}
                    onClick={() => setSelectedComponent(text)}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      background: selectedComponent === text ? "#e3f2fd" : "transparent",
                      color: selectedComponent === text ? "#1976d2" : "#666",
                      '&:hover': {
                        background: selectedComponent === text ? "#e3f2fd" : "#f5f5f5",
                      },
                      transition: "all 0.2s ease",
                      borderLeft: selectedComponent === text ? '4px solid #1976d2' : '4px solid transparent',
                      fontWeight: selectedComponent === text ? 600 : 400,
                      minHeight: 48,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: selectedComponent === text ? "#1976d2" : "#666",
                        minWidth: 40,
                      }}
                    >
                      {getIcon(text)}
                    </ListItemIcon>
                    <ListItemText
                      primary={text}
                      sx={{ 
                        fontWeight: selectedComponent === text ? 600 : 400,
                        color: selectedComponent === text ? "#1976d2" : "#666"
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          // mt: 8,
          minHeight: "100vh",
          background: "#fafafa",
          ...(showSidebar ? {} : { ml: 0 }),
        }}
      >
        {componentMap[selectedComponent]}
      </Box>
    </Box>
  );
}

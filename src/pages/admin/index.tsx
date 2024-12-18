import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import Users from "./pages/users/Users";
import AddEmails from "./pages/add-emails";
import BullMQDashboard from "../bullmq-dashboard";

const drawerWidth = 240;

// Explicitly type the components in the map
const componentMap = {
  Users: <Users />,
  "Add Email List": <AddEmails />,
  "View Queue": <BullMQDashboard />,
};

type ComponentKey = keyof typeof componentMap; // "Users" | "Add Emails" | "View Queue"

export default function Admin() {
  const [selectedComponent, setSelectedComponent] =
    useState<ComponentKey>("Users");

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {(Object.keys(componentMap) as ComponentKey[]).map(
              (text, index) => (
                <ListItem key={text} disablePadding>
                  <ListItemButton
                    selected={selectedComponent === text}
                    onClick={() => setSelectedComponent(text)}
                  >
                    <ListItemIcon>
                      {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
              )
            )}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {componentMap[selectedComponent]}
      </Box>
    </Box>
  );
}

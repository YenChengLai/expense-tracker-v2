import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import InsightsIcon from "@mui/icons-material/Insights";
import ListIcon from "@mui/icons-material/List";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";

const drawerWidth = 240;

function Sidebar({ role, userName, userImage }) {
  const location = useLocation();
  console.log("Sidebar re-rendered with location:", location.pathname); // Debug re-render
  console.log("userImage:", userImage); // Debug the received image

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#edf2f7",
          color: "#2d3748",
          borderRight: `1px solid ${"#e2e8f0"}`,
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar sx={{ justifyContent: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img
            src={userImage || "https://via.placeholder.com/40"}
            alt="User Profile"
            style={{ borderRadius: "50%", width: "40px", height: "40px", marginRight: "10px" }}
            onError={(e) => { e.target.src = "https://via.placeholder.com/40"; console.log("Image load failed, using placeholder"); }}
          />
          <Typography variant="h6" noWrap color="#2d3748">
            {userName || "User"}
          </Typography>
        </Box>
      </Toolbar>
      <List>
        <ListItem
          component={Link}
          to="/"
          selected={location.pathname === "/"}
          sx={{
            "& .MuiListItemIcon-root": {
              color: location.pathname === "/" ? "#33ccff" : "#00c4cc",
            },
            "& .MuiListItemText-primary": {
              color: location.pathname === "/" ? "#33ccff" : "#2d3748",
            },
          }}
          style={{
            backgroundColor: location.pathname === "/" ? "#003087 !important" : "transparent",
            transition: "background-color 0.3s ease",
          }}
        >
          <ListItemIcon>
            <InsightsIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem
          component={Link}
          to="/expenses"
          selected={location.pathname === "/expenses"}
          sx={{
            "& .MuiListItemIcon-root": {
              color: location.pathname === "/expenses" ? "#33ccff" : "#00c4cc",
            },
            "& .MuiListItemText-primary": {
              color: location.pathname === "/expenses" ? "#33ccff" : "#2d3748",
            },
          }}
          style={{
            backgroundColor: location.pathname === "/expenses" ? "#003087 !important" : "transparent",
            transition: "background-color 0.3s ease",
          }}
        >
          <ListItemIcon>
            <ListIcon />
          </ListItemIcon>
          <ListItemText primary="Expenses" />
        </ListItem>
        <ListItem
          component={Link}
          to="/settings"
          selected={location.pathname === "/settings"}
          sx={{
            "& .MuiListItemIcon-root": {
              color: location.pathname === "/settings" ? "#33ccff" : "#00c4cc",
            },
            "& .MuiListItemText-primary": {
              color: location.pathname === "/settings" ? "#33ccff" : "#2d3748",
            },
          }}
          style={{
            backgroundColor: location.pathname === "/settings" ? "#003087 !important" : "transparent",
            transition: "background-color 0.3s ease",
          }}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        {role === "admin" && (
          <ListItem
            component={Link}
            to="/admin/approvals"
            selected={location.pathname === "/admin/approvals"}
            sx={{
              "& .MuiListItemIcon-root": {
                color: location.pathname === "/admin/approvals" ? "#33ccff" : "#00c4cc",
              },
              "& .MuiListItemText-primary": {
                color: location.pathname === "/admin/approvals" ? "#33ccff" : "#2d3748",
              },
            }}
            style={{
              backgroundColor: location.pathname === "/admin/approvals" ? "#003087 !important" : "transparent",
              transition: "background-color 0.3s ease",
            }}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="User Approvals" />
          </ListItem>
        )}
      </List>
    </Drawer>
  );
}

export default Sidebar;
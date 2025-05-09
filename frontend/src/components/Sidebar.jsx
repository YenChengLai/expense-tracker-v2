import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import InsightsIcon from "@mui/icons-material/Insights";
import ListIcon from "@mui/icons-material/List";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const drawerWidth = 240;

function Sidebar({ role, userName, userImage }) {
  const location = useLocation();

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: (theme) => theme.palette.background.paper,
          color: (theme) => theme.palette.text.primary,
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
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
            style={{
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              marginRight: "10px",
            }}
          />
          <Typography
            variant="h6"
            noWrap
            sx={{ color: (theme) => theme.palette.text.primary }}
          >
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
              color:
                location.pathname === "/"
                  ? "#33ccff"
                  : (theme) => theme.palette.primary.main,
            },
            "& .MuiListItemText-primary": {
              color:
                location.pathname === "/"
                  ? "#33ccff"
                  : (theme) => theme.palette.text.primary,
            },
          }}
          style={{
            backgroundColor:
              location.pathname === "/" ? "#003087 !important" : "transparent",
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
              color:
                location.pathname === "/expenses"
                  ? "#33ccff"
                  : (theme) => theme.palette.primary.main,
            },
            "& .MuiListItemText-primary": {
              color:
                location.pathname === "/expenses"
                  ? "#33ccff"
                  : (theme) => theme.palette.text.primary,
            },
          }}
          style={{
            backgroundColor:
              location.pathname === "/expenses"
                ? "#003087 !important"
                : "transparent",
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
          to="/calendar"
          selected={location.pathname === "/calendar"}
          sx={{
            "& .MuiListItemIcon-root": {
              color:
                location.pathname === "/calendar"
                  ? "#33ccff"
                  : (theme) => theme.palette.primary.main,
            },
            "& .MuiListItemText-primary": {
              color:
                location.pathname === "/calendar"
                  ? "#33ccff"
                  : (theme) => theme.palette.text.primary,
            },
          }}
          style={{
            backgroundColor:
              location.pathname === "/calendar"
                ? "#003087 !important"
                : "transparent",
            transition: "background-color 0.3s ease",
          }}
        >
          <ListItemIcon>
            <CalendarTodayIcon />
          </ListItemIcon>
          <ListItemText primary="Calendar" />
        </ListItem>
        {role === "admin" && (
          <ListItem
            component={Link}
            to="/admin/approvals"
            selected={location.pathname === "/admin/approvals"}
            sx={{
              "& .MuiListItemIcon-root": {
                color:
                  location.pathname === "/admin/approvals"
                    ? "#33ccff"
                    : (theme) => theme.palette.primary.main,
              },
              "& .MuiListItemText-primary": {
                color:
                  location.pathname === "/admin/approvals"
                    ? "#33ccff"
                    : (theme) => theme.palette.text.primary,
              },
            }}
            style={{
              backgroundColor:
                location.pathname === "/admin/approvals"
                  ? "#003087 !important"
                  : "transparent",
              transition: "background-color 0.3s ease",
            }}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="User Approvals" />
          </ListItem>
        )}
        <ListItem
          component={Link}
          to="/settings"
          selected={location.pathname === "/settings"}
          sx={{
            "& .MuiListItemIcon-root": {
              color:
                location.pathname === "/settings"
                  ? "#33ccff"
                  : (theme) => theme.palette.primary.main,
            },
            "& .MuiListItemText-primary": {
              color:
                location.pathname === "/settings"
                  ? "#33ccff"
                  : (theme) => theme.palette.text.primary,
            },
          }}
          style={{
            backgroundColor:
              location.pathname === "/settings"
                ? "#003087 !important"
                : "transparent",
            transition: "background-color 0.3s ease",
          }}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Sidebar;

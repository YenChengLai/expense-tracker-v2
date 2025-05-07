import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import InsightsIcon from "@mui/icons-material/Insights";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";

const drawerWidth = 240;

function Sidebar({ role }) {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar>
        <Typography variant="h6" noWrap color="text.primary">
          Expense Tracker
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem
          component={Link}
          to="/"
          sx={{
            "&:hover": { backgroundColor: "action.hover" },
            "&.Mui-selected": { backgroundColor: "action.selected" },
          }}
        >
          <ListItemIcon sx={{ color: "text.primary" }}>
            <InsightsIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" primaryTypographyProps={{ color: "text.primary" }} />
        </ListItem>
        <ListItem
          component={Link}
          to="/add"
          sx={{
            "&:hover": { backgroundColor: "action.hover" },
            "&.Mui-selected": { backgroundColor: "action.selected" },
          }}
        >
          <ListItemIcon sx={{ color: "text.primary" }}>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Add a Record" primaryTypographyProps={{ color: "text.primary" }} />
        </ListItem>
        <ListItem
          component={Link}
          to="/list"
          sx={{
            "&:hover": { backgroundColor: "action.hover" },
            "&.Mui-selected": { backgroundColor: "action.selected" },
          }}
        >
          <ListItemIcon sx={{ color: "text.primary" }}>
            <ListIcon />
          </ListItemIcon>
          <ListItemText primary="Record List" primaryTypographyProps={{ color: "text.primary" }} />
        </ListItem>
        <ListItem
          component={Link}
          to="/settings"
          sx={{
            "&:hover": { backgroundColor: "action.hover" },
            "&.Mui-selected": { backgroundColor: "action.selected" },
          }}
        >
          <ListItemIcon sx={{ color: "text.primary" }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" primaryTypographyProps={{ color: "text.primary" }} />
        </ListItem>
        {role === "admin" && (
          <ListItem
            component={Link}
            to="/admin/approvals"
            sx={{
              "&:hover": { backgroundColor: "action.hover" },
              "&.Mui-selected": { backgroundColor: "action.selected" },
            }}
          >
            <ListItemIcon sx={{ color: "text.primary" }}>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="User Approvals" primaryTypographyProps={{ color: "text.primary" }} />
          </ListItem>
        )}
      </List>
    </Drawer>
  );
}

export default Sidebar;
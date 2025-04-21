import { Link, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
} from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

const drawerWidth = 240;

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { text: "Dashboard", path: "/", icon: <InsightsIcon /> },
    { text: "Add a Record", path: "/add", icon: <AddIcon /> },
    { text: "Record List", path: "/list", icon: <ListIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar>
        <AccountBalanceWalletIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap>
          Expense Tracker
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
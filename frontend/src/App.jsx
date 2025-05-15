import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import LogoutIcon from "@mui/icons-material/ExitToApp";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Expenses from "./components/Expenses";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import ForgotPassword from "./components/ForgotPassword";
import Signup from "./components/Signup";
import AdminApproval from "./components/AdminApproval";
import Calendar from "./components/Calendar";
import axios from "axios";
import { lightTheme, darkTheme } from "./theme";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [refreshRecords, setRefreshRecords] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [mode, setMode] = useState("light");
  const [userRole, setUserRole] = useState(null);
  const theme = mode === "light" ? lightTheme : darkTheme;
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          // Step 1: Verify token with auth-service
          const authResponse = await axios.get(
            "http://127.0.0.1:8002/verify-token",
            {
              params: { token },
            }
          );
          const { role, userId } = authResponse.data;
          setUserRole(role);

          // Step 2: Fetch user profile from expense-service
          const profileResponse = await axios.get(
            "http://127.0.0.1:8001/user",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const { name, image } = profileResponse.data;
          setUserName(name || "Visitor");
          setUserImage(image || "https://picsum.photos/40");
        } catch (err) {
          console.error("Failed to fetch user data:", err);
          setUserRole(null);
          setUserName("Visitor");
          setUserImage("https://picsum.photos/40");
          localStorage.removeItem("token");
          setToken("");
        }
      } else {
        setUserRole(null);
        setUserName("Visitor");
        setUserImage("https://picsum.photos/40");
      }
    };
    fetchUserData();
  }, [token]);

  const handleRecordAdded = async (payload) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8001/expense",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setRefreshRecords((prev) => prev + 1);
      setSnackbar({
        open: true,
        message: "Record added successfully!",
        severity: "success",
      });
      return response.data;
    } catch (err) {
      console.error("Error in POST /expense:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });
      throw new Error(
        err.response?.data?.detail ||
          "Failed to add record. Please check your connection or login again."
      );
    }
  };

  const handleCategoryAdded = (category) => {
    setRefreshRecords((prev) => prev + 1);
    setSnackbar({
      open: true,
      message: `Category '${category}' added successfully!`,
      severity: "success",
    });
  };

  const handleRecordUpdated = (message) => {
    setRefreshRecords((prev) => prev + 1);
    setSnackbar({ open: true, message, severity: "success" });
  };

  const handleCategoryUpdated = (message) => {
    setRefreshRecords((prev) => prev + 1);
    setSnackbar({ open: true, message, severity: "success" });
  };

  const handleProfileUpdated = (updatedProfile) => {
    setUserName(updatedProfile.name || "Visitor");
    setUserImage(updatedProfile.image || "https://picsum.photos/40");
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "success" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUserRole(null);
    setUserName("Visitor");
    setUserImage("https://picsum.photos/40");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {token ? (
          <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar
              role={userRole}
              userName={userName}
              userImage={userImage}
            />
            <Box
              component="main"
              sx={{ flexGrow: 1, width: { sm: `calc(100% - 240px)` }, p: 0 }}
            >
              <AppBar
                position="fixed"
                sx={{
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Toolbar sx={{ justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={userImage}
                      alt="User Profile"
                      style={{
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        marginRight: "10px",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.primary }}
                    >
                      {userName}
                    </Typography>
                  </Box>
                  <Box>
                    <Button
                      color="inherit"
                      onClick={() =>
                        setMode(mode === "light" ? "dark" : "light")
                      }
                      startIcon={
                        mode === "light" ? (
                          <Brightness4Icon />
                        ) : (
                          <Brightness7Icon />
                        )
                      }
                      sx={{
                        mr: 1,
                        color: theme.palette.text.secondary,
                        "&:hover": { color: theme.palette.text.primary },
                      }}
                    >
                      {mode === "light" ? "Dark" : "Light"} Mode
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<LogoutIcon />}
                      onClick={handleLogout}
                      sx={{
                        color: theme.palette.text.secondary,
                        borderColor: theme.palette.divider,
                        "&:hover": {
                          color: theme.palette.primary.main,
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      Logout
                    </Button>
                  </Box>
                </Toolbar>
              </AppBar>
              <Toolbar />
              <Box
                sx={{ p: 3, backgroundColor: theme.palette.background.default }}
              >
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Dashboard token={token} refreshKey={refreshRecords} />
                    }
                  />
                  <Route
                    path="/expenses"
                    element={
                      <Expenses
                        token={token}
                        onRecordAdded={handleRecordAdded}
                        onCategoryAdded={handleCategoryAdded}
                        onRecordUpdated={handleRecordUpdated}
                      />
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <Settings
                        token={token}
                        onCategoryUpdated={handleCategoryUpdated}
                        onProfileUpdated={handleProfileUpdated}
                      />
                    }
                  />
                  <Route
                    path="/admin/approvals"
                    element={<AdminApproval token={token} />}
                  />
                  <Route
                    path="/calendar"
                    element={<Calendar token={token} />}
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Box>
            </Box>
          </Box>
        ) : (
          <Routes>
            <Route
              path="/login"
              element={<Login setToken={setToken} theme={theme} />}
            />
            <Route
              path="/forgot-password"
              element={<ForgotPassword theme={theme} />}
            />
            <Route path="/signup" element={<Signup theme={theme} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Router>
    </ThemeProvider>
  );
}

export default App;

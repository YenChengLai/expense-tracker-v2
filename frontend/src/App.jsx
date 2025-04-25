import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
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
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import ForgotPassword from "./components/ForgotPassword";
import axios from "axios";

// Define light and dark themes
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#d32f2f" },
    background: { default: "#f4f7fa" },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },
    secondary: { main: "#f48fb1" },
    background: { default: "#121212" },
  },
});

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [refreshRecords, setRefreshRecords] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [mode, setMode] = useState("light");
  const theme = mode === "light" ? lightTheme : darkTheme;

  const handleRecordAdded = async (payload) => {
    console.log("handleRecordAdded called with payload:", payload);
    console.log("Token:", token);
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
      console.log("POST /expense response:", response.data);
      setRefreshRecords((prev) => prev + 1);
      setSnackbar({ open: true, message: "Record added successfully!", severity: "success" });
      return response.data;
    } catch (err) {
      console.error("Error in POST /expense:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });
      throw new Error(err.response?.data?.detail || "Failed to add record. Please check your connection or login again.");
    }
  };

  const handleCategoryAdded = (category) => {
    setRefreshRecords((prev) => prev + 1);
    setSnackbar({ open: true, message: `Category '${category}' added successfully!`, severity: "success" });
  };

  const handleRecordUpdated = (message) => {
    setRefreshRecords((prev) => prev + 1);
    setSnackbar({ open: true, message, severity: "success" });
  };

  const handleCategoryUpdated = (message) => {
    setRefreshRecords((prev) => prev + 1);
    setSnackbar({ open: true, message, severity: "success" });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "success" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {token ? (
          <Box sx={{ display: "flex" }}>
            <Sidebar />
            <Box
              component="main"
              sx={{ flexGrow: 1, width: { sm: `calc(100% - 240px)` } }}
            >
              <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Expense Tracker
                  </Typography>
                  <Button
                    color="inherit"
                    onClick={() => setMode(mode === "light" ? "dark" : "light")}
                    startIcon={mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
                    sx={{ mr: 1 }}
                  >
                    {mode === "light" ? "Dark" : "Light"} Mode
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Toolbar>
              </AppBar>
              <Toolbar />
              <Box sx={{ p: 3 }}>
                <Routes>
                  <Route
                    path="/"
                    element={<Dashboard token={token} refreshKey={refreshRecords} />}
                  />
                  <Route
                    path="/add"
                    element={
                      <TransactionForm
                        token={token}
                        onRecordAdded={handleRecordAdded}
                        onCategoryAdded={handleCategoryAdded}
                      />
                    }
                  />
                  <Route
                    path="/list"
                    element={
                      <TransactionList
                        token={token}
                        refreshKey={refreshRecords}
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
                      />
                    }
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/" />}
                  />
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
            <Route
              path="*"
              element={<Navigate to="/login" />}
            />
          </Routes>
        )}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Router>
    </ThemeProvider>
  );
}

export default App;
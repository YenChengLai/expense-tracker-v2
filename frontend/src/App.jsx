import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import LogoutIcon from "@mui/icons-material/ExitToApp";
import Sidebar from "./components/Sidebar";
import LoginForm from "./components/LoginForm";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import Dashboard from "./components/Dashboard";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#d32f2f" },
    background: { default: "#f4f7fa" },
  },
});

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [refreshRecords, setRefreshRecords] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const handleRecordAdded = () => {
    setRefreshRecords((prev) => prev + 1);
    setSnackbar({ open: true, message: "Record added successfully!" });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "" });
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
                    variant="outlined"
                    color="inherit"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Toolbar>
              </AppBar>
              <Toolbar /> {/* Offset content below AppBar */}
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
                      />
                    }
                  />
                  <Route
                    path="/list"
                    element={<TransactionList token={token} refreshKey={refreshRecords} />}
                  />
                </Routes>
              </Box>
            </Box>
          </Box>
        ) : (
          <LoginForm setToken={setToken} />
        )}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Router>
    </ThemeProvider>
  );
}

export default App;
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Sidebar from "./components/Sidebar";
import LoginForm from "./components/LoginForm";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
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
  const [refreshExpenses, setRefreshExpenses] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const handleExpenseAdded = () => {
    setRefreshExpenses((prev) => prev + 1);
    setSnackbar({ open: true, message: "Expense added successfully!" });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "" });
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
              sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - 240px)` } }}
            >
              <Toolbar />
              <Routes>
                <Route
                  path="/"
                  element={<Dashboard token={token} refreshKey={refreshExpenses} />}
                />
                <Route
                  path="/add"
                  element={
                    <ExpenseForm
                      token={token}
                      onExpenseAdded={handleExpenseAdded}
                      setToken={setToken}
                    />
                  }
                />
                <Route
                  path="/list"
                  element={<ExpenseList token={token} refreshKey={refreshExpenses} />}
                />
              </Routes>
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
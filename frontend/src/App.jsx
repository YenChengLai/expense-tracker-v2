import { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Container from "@mui/material/Container";
import LoginForm from "./components/LoginForm";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        {!token ? (
          <LoginForm setToken={setToken} />
        ) : (
          <>
            <ExpenseForm token={token} onExpenseAdded={() => setRefreshExpenses((prev) => prev + 1)} />
            <ExpenseList token={token} refreshKey={refreshExpenses} />
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
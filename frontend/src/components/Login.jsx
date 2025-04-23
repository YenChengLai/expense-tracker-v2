import React, { useState } from "react";
import axios from "axios";
import {
  CssBaseline,
  Stack,
  Box,
  Alert,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

export default function Login({ setToken, theme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post("http://127.0.0.1:8002/login", {
        email,
        password,
      });
      const token = response.data.access_token;
      localStorage.setItem("token", token);
      setToken(token);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Stack
        direction="column"
        component="main"
        sx={{
          justifyContent: "center",
          minHeight: "100vh",
          backgroundImage: theme.palette.mode === "light"
            ? "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))"
            : "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
          backgroundRepeat: "no-repeat",
          "&::before": {
            content: '""',
            position: "absolute",
            zIndex: -1,
            inset: 0,
            backgroundImage: theme.palette.mode === "light"
              ? "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))"
              : "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
          },
        }}
      >
        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          sx={{
            justifyContent: "center",
            gap: { xs: 6, sm: 12 },
            p: { xs: 2, sm: 4 },
            m: "auto",
            maxWidth: "1200px",
          }}
        >
          <Box sx={{ maxWidth: { xs: "100%", md: "50%" }, p: 2 }}>
            <Typography variant="h4" gutterBottom>
              Welcome to Expense Tracker
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your expenses and income with ease. Sign in to access your personalized
              dashboard, track transactions, and organize categories.
            </Typography>
          </Box>
          <Box
            sx={{
              maxWidth: { xs: "100%", md: 400 },
              width: "100%",
              p: 2,
              bgcolor: "background.paper",
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" gutterBottom>
              Sign In
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {/* Added loading indicator */}
            {isLoading && (
              <Box display="flex" justifyContent="center" mb={2}>
                <CircularProgress />
              </Box>
            )}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              {/* Added Forgot Password link */}
              <Box sx={{ textAlign: "right", mb: 1 }}>
                <Button
                  variant="text"
                  size="small"
                  href="/forgot-password" // Assumes backend endpoint
                  disabled={isLoading}
                >
                  Forgot Password?
                </Button>
              </Box>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                sx={{ mt: 1 }}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
              {/* Added Sign Up link */}
              <Button
                variant="text"
                fullWidth
                href="/register" // Assumes backend endpoint
                disabled={isLoading}
                sx={{ mt: 1 }}
              >
                Don’t have an account? Sign Up
              </Button>
            </Box>
          </Box>
        </Stack>
      </Stack>
    </ThemeProvider>
  );
}
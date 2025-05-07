import React, { useState } from "react";
import axios from "axios";
import {
  CssBaseline,
  Card,
  CardContent,
  Alert,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Link } from "react-router-dom";

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
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "background.default",
          backgroundImage: theme.palette.mode === "light"
            ? "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))"
            : "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Card sx={{ maxWidth: 400, width: "100%", p: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Sign In
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Welcome to Expense Tracker! Sign in to manage your expenses and income with ease.
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
              <Box sx={{ textAlign: "right", mb: 1 }}>
                <Button
                  component={Link}
                  to="/forgot-password"
                  variant="text"
                  color="primary"
                  size="small"
                  disabled={isLoading}
                >
                  Forgot Password?
                </Button>
              </Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isLoading}
                sx={{ mt: 1 }}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Button
                  component={Link}
                  to="/signup"
                  variant="text"
                  color="primary"
                  size="small"
                  disabled={isLoading}
                >
                  Don’t have an account? Sign Up
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
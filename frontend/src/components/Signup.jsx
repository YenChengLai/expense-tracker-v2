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

export default function Signup({ theme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await axios.post("http://127.0.0.1:8002/signup", { email, password });
      setSuccess(response.data.message);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit registration. Please try again.");
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
              Sign Up
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Join Expense Tracker to manage your expenses and income with ease.
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
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
                placeholder="Create a password"
                required
                disabled={isLoading}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                {isLoading ? "Submitting..." : "Submit Registration"}
              </Button>
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="text"
                  color="primary"
                  size="small"
                  disabled={isLoading}
                >
                  Already have an account? Sign In
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
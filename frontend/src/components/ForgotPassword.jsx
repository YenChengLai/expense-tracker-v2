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

export default function ForgotPassword({ theme }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await axios.post("http://127.0.0.1:8002/forgot-password", { email });
      setSuccess(response.data.message);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send reset link. Please try again.");
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
              Reset Password
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Enter your email address below, and we’ll send you a link to reset your password.
              You’ll be back to tracking your expenses in no time!
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
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
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
                  Back to Sign In
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
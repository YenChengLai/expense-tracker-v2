import { useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
} from "@mui/material";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { DateTime } from "luxon";
import LogoutIcon from "@mui/icons-material/ExitToApp";

function ExpenseForm({ token, onExpenseAdded, setToken }) {
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: null,
    description: "",
    type: "expense",
    currency: "USD",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await axios.post(
        "http://127.0.0.1:8001/expense",
        { ...formData, date: formData.date?.toISO() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData({ amount: "", category: "", date: null, description: "", type: "expense", currency: "USD" });
      onExpenseAdded();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add expense.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Expense Tracker
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
        <Typography variant="h6" gutterBottom>
          Add Expense
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="normal"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="Enter amount"
            required
            disabled={isLoading}
          />
          <TextField
            label="Category"
            type="text"
            fullWidth
            margin="normal"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Enter category"
            required
            disabled={isLoading}
          />
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <DateTimePicker
              label="Date"
              value={formData.date}
              onChange={(newValue) => setFormData({ ...formData, date: newValue })}
              slotProps={{ textField: { fullWidth: true, margin: "normal", required: true } }}
              disabled={isLoading}
            />
          </LocalizationProvider>
          <TextField
            label="Description"
            type="text"
            fullWidth
            margin="normal"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter description (optional)"
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? "Adding..." : "Add Expense"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ExpenseForm;
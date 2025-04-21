import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
} from "@mui/material";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";

function TransactionForm({ token, onRecordAdded }) {
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: null,
    description: "",
    type: "expense",
    currency: "USD",
  });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8001/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data);
      } catch (err) {
        setCategoryError("Failed to load categories.");
      }
    };
    fetchCategories();
  }, [token]);

  // Handle category selection
  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setShowNewCategoryInput(value === "__add_new");
    setFormData({ ...formData, category: value === "__add_new" ? "" : value });
  };

  // Handle new category submission
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setCategoryError("Category name cannot be empty.");
      return;
    }
    setIsLoading(true);
    setCategoryError("");
    try {
      await axios.post(
        "http://127.0.0.1:8001/categories",
        { category: newCategory.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      setFormData({ ...formData, category: newCategory.trim() });
      setNewCategory("");
      setShowNewCategoryInput(false);
    } catch (err) {
      setCategoryError(err.response?.data?.detail || "Failed to add category.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || formData.category === "__add_new") {
      setError("Please select or add a valid category.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const payload = {
        ...formData,
        date: formData.date ? formData.date.toISODate() : null, // Send YYYY-MM-DD
      };
      await axios.post("http://127.0.0.1:8001/expense", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ amount: "", category: "", date: null, description: "", type: "expense", currency: "USD" });
      onRecordAdded();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add record.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Add a Record
        </Typography>
        {(error || categoryError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || categoryError}
          </Alert>
        )}
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
          <FormControl fullWidth margin="normal" disabled={isLoading}>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category || ""}
              label="Category"
              onChange={handleCategoryChange}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
              <MenuItem value="__add_new">Add New Category</MenuItem>
            </Select>
          </FormControl>
          <Collapse in={showNewCategoryInput}>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                label="New Category"
                type="text"
                fullWidth
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category"
                disabled={isLoading}
              />
              <Button
                variant="outlined"
                onClick={handleAddCategory}
                disabled={isLoading}
                sx={{ minWidth: 120 }}
              >
                {isLoading ? "Adding..." : "Add"}
              </Button>
            </Box>
          </Collapse>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <DatePicker
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
          <FormControl fullWidth margin="normal" disabled={isLoading}>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              label="Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="expense">Expense</MenuItem>
              <MenuItem value="income">Income</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? "Adding..." : "Add Record"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TransactionForm;
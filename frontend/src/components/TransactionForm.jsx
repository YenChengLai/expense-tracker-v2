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
import { DateTime } from "luxon";

function TransactionForm({ token, onRecordAdded, onCategoryAdded, initialData = null }) {
  const [formData, setFormData] = useState(
    initialData || {
      amount: "",
      category: "",
      date: null,
      description: "",
      type: "expense",
      currency: "USD",
    }
  );
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount?.toString() || "",
        category: initialData.category || "",
        date: initialData.date ? DateTime.fromISO(initialData.date) : null,
        description: initialData.description || "",
        type: initialData.type || "expense",
        currency: initialData.currency || "USD",
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8001/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data || []);
      } catch (err) {
        setCategoryError("Failed to load categories. Please try again.");
      }
    };
    fetchCategories();
  }, [token]);

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setShowNewCategoryInput(value === "__add_new");
    setFormData({ ...formData, category: value === "__add_new" ? "" : value });
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setCategoryError("Category name cannot be empty.");
      return;
    }
    setIsLoading(true);
    setCategoryError("");
    try {
      const response = await axios.post(
        "http://127.0.0.1:8001/categories",
        { name: newCategory.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newCat = response.data.name;
      setCategories([...categories, newCat]);
      setFormData({ ...formData, category: newCat });
      setNewCategory("");
      setShowNewCategoryInput(false);
      onCategoryAdded(newCat);
    } catch (err) {
      setCategoryError(
        err.response?.data?.detail === "Category already exists for this user"
          ? `Category '${newCategory}' already exists. Please choose it from the list.`
          : "Failed to add category. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || formData.category === "__add_new") {
      setError("Please select or add a valid category.");
      return;
    }
    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!formData.date) {
      setError("Please select a date.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date.toISODate(),
        description: formData.description || null,
        type: formData.type,
        currency: formData.currency,
      };
      await onRecordAdded(payload);
      if (!initialData) {
        setFormData({ amount: "", category: "", date: null, description: "", type: "expense", currency: "USD" });
      }
    } catch (err) {
      setError(err.message || "Failed to add or update record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {initialData ? "Edit Record" : "Add a Record"}
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
            <Box sx={{ display: "flex", gap: 2, mt: 2, flexDirection: { xs: "column", sm: "row" } }}>
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
            {isLoading ? "Saving..." : initialData ? "Update Record" : "Add Record"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TransactionForm;
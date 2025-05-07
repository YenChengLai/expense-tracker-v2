import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Button,
  Box,
  Collapse,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function Expenses({ token, onRecordAdded, onCategoryAdded, onRecordUpdated }) {
  const [transactions, setTransactions] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    amount: "",
    category: "",
    type: "",
    date: "",
    description: "",
  });
  const [categories, setCategories] = useState([]);
  const [recentCategories, setRecentCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:8001/expense", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(response.data || []);
      } catch (err) {
        setError("Failed to load transactions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8001/categories", {
          headers: { Authorization: `Bearer ${token}` },
          params: { show_universal: true },
        });
        setCategories(response.data.map(cat => cat.name) || []);
      } catch (err) {
        setCategoryError("Failed to load categories. Please try again.");
      }
    };
    fetchTransactions();
    fetchCategories();
    setRecentCategories(JSON.parse(localStorage.getItem("recentCategories") || "[]"));
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
    if (!formData.category || formData.category === "__add_new" || !formData.amount || !formData.type || !formData.date) {
      setError("All fields are required.");
      return;
    }
    if (isNaN(parseFloat(formData.amount))) {
      setError("Please enter a valid amount.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        type: formData.type,
        date: formData.date,
        description: formData.description || null,
      };
      let response;
      if (editingId) {
        response = await axios.put(`http://127.0.0.1:8001/expense/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        onRecordUpdated(`Record with ID ${editingId} updated successfully!`);
        setTransactions(transactions.map(tx => tx.id === editingId ? response.data : tx));
      } else {
        response = await onRecordAdded(payload);
        setTransactions([...transactions, response]);
        const updatedRecent = [
          formData.category,
          ...recentCategories.filter((cat) => cat !== formData.category),
        ].slice(0, 5);
        localStorage.setItem("recentCategories", JSON.stringify(updatedRecent));
        setRecentCategories(updatedRecent);
      }
      setFormData({ id: null, amount: "", category: "", type: "", date: "", description: "" });
      setFormOpen(false);
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Failed to save record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (tx) => {
    setEditingId(tx.id);
    setFormData({
      id: tx.id,
      amount: tx.amount,
      category: tx.category,
      type: tx.type,
      date: tx.date,
      description: tx.description || "",
    });
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await axios.delete(`http://127.0.0.1:8001/expense/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(transactions.filter((tx) => tx.id !== id));
      setSnackbar({ open: true, message: "Record deleted successfully!", severity: "success" });
    } catch (err) {
      setError("Failed to delete record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "success" });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Expenses
          </Typography>
          {(error || categoryError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || categoryError}
            </Alert>
          )}
          {isLoading && (
            <Box display="flex" justifyContent="center" mb={2}>
              <CircularProgress />
            </Box>
          )}
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Amount</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell sx={{ color: tx.type === "Expense" ? "red" : "green" }}>
                    {`${tx.amount} USD`}
                  </TableCell>
                  <TableCell>{tx.category}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{tx.description || "-"}</TableCell>
                  <TableCell>
                    <IconButton color="primary" aria-label="edit" onClick={() => handleEdit(tx)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" aria-label="delete" onClick={() => handleDelete(tx.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
            sx={{ mt: 2 }}
          >
            Add Record
          </Button>
          <Collapse in={formOpen}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                margin="normal"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                  {recentCategories.length > 0 && (
                    <MenuItem disabled value="">
                      <em>Recent</em>
                    </MenuItem>
                  )}
                  {recentCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                  <MenuItem disabled value="">
                    <em>All</em>
                  </MenuItem>
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
                    disabled={isLoading}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleAddCategory}
                    disabled={isLoading}
                  >
                    Add
                  </Button>
                </Box>
              </Collapse>
              <FormControl fullWidth margin="normal" disabled={isLoading}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <MenuItem value="Expense">Expense</MenuItem>
                  <MenuItem value="Income">Income</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Date"
                type="date"
                fullWidth
                margin="normal"
                value={formData.date || ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Description"
                type="text"
                fullWidth
                margin="normal"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isLoading}
              />
              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                  sx={{ mr: 2 }}
                >
                  {isLoading ? "Saving..." : editingId ? "Update Record" : "Add Record"}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setFormOpen(false);
                    setFormData({ id: null, amount: "", category: "", type: "", date: "", description: "" });
                    setEditingId(null);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Expenses;
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function Settings({ token, onCategoryUpdated }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, name: "" });

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await axios.get("http://127.0.0.1:8001/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load categories.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [token]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setError("Category name cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "http://127.0.0.1:8001/categories",
        { name: newCategory.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories([...categories, response.data.name]);
      setNewCategory("");
      onCategoryUpdated(`Category '${response.data.name}' added successfully!`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add category.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editName.trim()) {
      setError("Category name cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.put(
        `http://127.0.0.1:8001/categories/${editCategory}`,
        { name: editName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(categories.map((cat) => (cat === editCategory ? response.data.name : cat)));
      setEditCategory(null);
      setEditName("");
      onCategoryUpdated(`Category updated to '${response.data.name}' successfully!`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update category.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    setIsLoading(true);
    setError("");
    try {
      await axios.delete(
        `http://127.0.0.1:8001/categories/${deleteDialog.name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(categories.filter((cat) => cat !== deleteDialog.name));
      setDeleteDialog({ open: false, name: "" });
      onCategoryUpdated(`Category '${deleteDialog.name}' deleted successfully!`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete category.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Settings
        </Typography>
        <Typography variant="h8" gutterBottom>
          Category Management
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="New Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              fullWidth
              disabled={isLoading}
            />
            <Button
              variant="contained"
              onClick={handleAddCategory}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add"}
            </Button>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat}>
                  <TableCell>{cat}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setEditCategory(cat);
                        setEditName(cat);
                      }}
                      disabled={isLoading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => setDeleteDialog({ open: true, name: cat })}
                      disabled={isLoading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Dialog open={editCategory !== null} onClose={() => setEditCategory(null)}>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogContent>
            <TextField
              label="Category Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditCategory(null)}>Cancel</Button>
            <Button onClick={handleEditCategory} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, name: "" })}>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the category '{deleteDialog.name}'?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, name: "" })}>Cancel</Button>
            <Button onClick={handleDeleteCategory} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default Settings;
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
  const [profile, setProfile] = useState({ email: "", password: "" });
  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch current user's ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8001/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUserId(response.data.userId);
      } catch (err) {
        console.error("Fetch user ID error:", err);
        setError(err.response?.data?.detail || "Failed to load user data.");
      }
    };
    fetchUserId();
  }, [token]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await axios.get("http://127.0.0.1:8001/categories", {
          headers: { Authorization: `Bearer ${token}` },
          params: { show_universal: true },
        });
        setCategories(response.data || []);
      } catch (err) {
        console.error("Fetch categories error:", err);
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
      setCategories([...categories, response.data]);
      setNewCategory("");
      onCategoryUpdated(`Category '${response.data.name}' added successfully!`);
    } catch (err) {
      console.error("Add category error:", err);
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
      setCategories(
        categories.map((cat) =>
          cat.name === editCategory ? response.data : cat
        )
      );
      setEditCategory(null);
      setEditName("");
      onCategoryUpdated(`Category updated to '${response.data.name}' successfully!`);
    } catch (err) {
      console.error("Edit category error:", err);
      setError(err.response?.data?.detail || "Failed to update category.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    setIsLoading(true);
    setError("");
    try {
      await axios.delete(`http://127.0.0.1:8001/categories/${deleteDialog.name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter((cat) => cat.name !== deleteDialog.name));
      setDeleteDialog({ open: false, name: "" });
      onCategoryUpdated(`Category '${deleteDialog.name}' deleted successfully!`);
    } catch (err) {
      console.error("Delete category error:", err);
      setError(err.response?.data?.detail || "Failed to delete category.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profile.email.trim()) {
      setError("Email cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await axios.put(
        "http://127.0.0.1:8001/user",
        { email: profile.email, password: profile.password || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCategoryUpdated("Profile updated successfully!");
      setProfile({ email: "", password: "" });
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.detail || "Failed to update profile.");
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
                <TableRow key={cat.name}>
                  <TableCell sx={{ fontStyle: cat.userId ? "normal" : "italic" }}>
                    {cat.name}
                  </TableCell>
                  <TableCell>
                    {cat.userId && cat.userId === currentUserId ? (
                      <>
                        <IconButton
                          onClick={() => {
                            setEditCategory(cat.name);
                            setEditName(cat.name);
                          }}
                          disabled={isLoading}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => setDeleteDialog({ open: true, name: cat.name })}
                          disabled={isLoading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No actions available
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Profile
          </Typography>
          <TextField
            label="Email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            fullWidth
            margin="normal"
            disabled={isLoading}
          />
          <TextField
            label="New Password"
            type="password"
            value={profile.password}
            onChange={(e) => setProfile({ ...profile, password: e.target.value })}
            fullWidth
            margin="normal"
            disabled={isLoading}
          />
          <Button
            onClick={handleProfileUpdate}
            variant="contained"
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
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
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, name: "" })}
        >
          <DialogTitle>Delete Category</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the category '{deleteDialog.name}'?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, name: "" })}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteCategory}
              variant="contained"
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default Settings;
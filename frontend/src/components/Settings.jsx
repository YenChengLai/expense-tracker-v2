import { useState, useEffect, useMemo } from "react";
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
  Tabs,
  Tab,
  Grid,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  LinearProgress,
  Checkbox,
  TableSortLabel,
  Snackbar,
  Avatar,
  Fade,
  Backdrop,
  CircularProgress,
  Paper,
  InputBase,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CategoryIcon from "@mui/icons-material/Category";
import TuneIcon from "@mui/icons-material/Tune";
import WarningIcon from "@mui/icons-material/Warning";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LockIcon from "@mui/icons-material/Lock";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ClearIcon from "@mui/icons-material/Clear";
import PaletteIcon from "@mui/icons-material/Palette";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";

function Settings({ token, onCategoryUpdated, onProfileUpdated, setMode }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, name: "" });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    image: null,
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    newPassword: "",
    confirmNewPassword: "",
    language: "English",
  });
  const [initialProfile, setInitialProfile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "English",
    notifications: false,
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
  });
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState("");
  const [profileProgress, setProfileProgress] = useState(0);
  const [profileStep, setProfileStep] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortBy, setSortBy] = useState("name");
  const [newImage, setNewImage] = useState(null);
  const [isReloading, setIsReloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const hasChanges = useMemo(() => {
    return initialProfile
      ? profile.name !== initialProfile.name ||
          profile.email !== initialProfile.email ||
          (newImage !== null && newImage !== initialProfile.image) ||
          profile.image !== initialProfile.image ||
          (profile.newPassword &&
            profile.newPassword === profile.confirmNewPassword)
      : false;
  }, [profile, initialProfile, newImage]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const authResponse = await axios.get(
          "http://127.0.0.1:8002/verify-token",
          {
            params: { token },
          }
        );
        setUserRole(authResponse.data.role);

        const profileResponse = await axios.get("http://127.0.0.1:8001/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUserId(profileResponse.data.userId);
        const userProfile = {
          name: profileResponse.data.name || "",
          email: profileResponse.data.email || "",
          image: profileResponse.data.image || null,
          currency: profileResponse.data.currency || "USD",
          dateFormat: profileResponse.data.dateFormat || "MM/DD/YYYY",
          newPassword: "",
          confirmNewPassword: "",
          language: profileResponse.data.language || "English",
        };
        setProfile(userProfile);
        setInitialProfile(userProfile);
        const fetchedThemeMode = profileResponse.data.themeMode || "light";
        setPreferences((prev) => ({
          ...prev,
          language: userProfile.language || "English",
          currency: userProfile.currency || "USD",
          dateFormat: userProfile.dateFormat || "MM/DD/YYYY",
          theme: fetchedThemeMode,
        }));
        if (typeof setMode === "function" && fetchedThemeMode !== undefined) {
          setMode(fetchedThemeMode);
        }
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load user data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [token]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError("");
      try {
        const showUniversal =
          categoryFilter === "universal" || categoryFilter === "all";
        const response = await axios.get("http://127.0.0.1:8001/categories", {
          headers: { Authorization: `Bearer ${token}` },
          params: { show_universal: showUniversal },
        });
        setCategories(response.data || []);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load categories.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [token, categoryFilter]);

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
      const newCat = { ...response.data, userId: currentUserId };
      setCategories([...categories, newCat]);
      setNewCategory("");
      setSnackbar({
        open: true,
        message: `Category '${response.data.name}' added successfully!`,
        severity: "success",
      });
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
      setCategories(
        categories.map((cat) =>
          cat.name === editCategory
            ? { ...response.data, userId: cat.userId }
            : cat
        )
      );
      setEditCategory(null);
      setEditName("");
      setSnackbar({
        open: true,
        message: `Category updated to '${response.data.name}' successfully!`,
        severity: "success",
      });
      onCategoryUpdated(
        `Category updated to '${response.data.name}' successfully!`
      );
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategories(categories.filter((cat) => cat.name !== deleteDialog.name));
      setDeleteDialog({ open: false, name: "" });
      setSnackbar({
        open: true,
        message: `Category '${deleteDialog.name}' deleted successfully!`,
        severity: "success",
      });
      onCategoryUpdated(
        `Category '${deleteDialog.name}' deleted successfully!`
      );
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete category.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsLoading(true);
    setError("");
    try {
      for (const name of selectedCategories) {
        await axios.delete(`http://127.0.0.1:8001/categories/${name}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setCategories(
        categories.filter((cat) => !selectedCategories.includes(cat.name))
      );
      setSelectedCategories([]);
      setBulkDeleteDialog(false);
      setSnackbar({
        open: true,
        message: "Selected categories deleted successfully!",
        severity: "success",
      });
      onCategoryUpdated("Selected categories deleted successfully!");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete categories.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      image: null,
    }));
    setNewImage(null);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileProgress(33);
    setProfileStep("Validating inputs...");
    const hasPasswordUpdate =
      profile.newPassword && profile.newPassword === profile.confirmNewPassword;
    if (hasPasswordUpdate && profile.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      setProfileProgress(0);
      setProfileStep("");
      return;
    }

    setProfileProgress(66);
    setProfileStep("Saving changes...");
    try {
      const profileUpdate = {
        name: profile.name || undefined,
        email: profile.email || undefined,
        image: newImage || profile.image || null,
        language: profile.language,
      };
      const response = await axios.put(
        "http://127.0.0.1:8001/user",
        profileUpdate,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (hasPasswordUpdate) {
        await axios.put(
          "http://127.0.0.1:8002/user/password",
          {
            password: profile.newPassword,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const updatedProfile = {
        ...profile,
        ...response.data,
        newPassword: "",
        confirmNewPassword: "",
        image: newImage || response.data.image || null,
      };
      setProfile(updatedProfile);
      setInitialProfile({ ...updatedProfile });
      setNewImage(null);
      setProfileProgress(100);
      setProfileStep("Profile updated successfully!");
      setSnackbar({
        open: true,
        message: "Profile updated successfully! Reloading...",
        severity: "success",
      });

      onProfileUpdated({
        name: updatedProfile.name,
        email: updatedProfile.email,
        image: updatedProfile.image,
      });

      setIsReloading(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile.");
      setProfileProgress(0);
      setProfileStep("");
    }
  };

  const handleDiscardChanges = () => {
    setProfile(initialProfile);
    setNewImage(null);
    setProfileProgress(0);
    setProfileStep("");
    setError("");
  };

  const handlePreferencesUpdate = async () => {
    setIsLoading(true);
    setError("");
    try {
      const userUpdate = {
        language: preferences.language,
        currency: preferences.currency,
        dateFormat: preferences.dateFormat,
        themeMode: preferences.theme,
      };
      await axios.put("http://127.0.0.1:8001/user", userUpdate, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile((prev) => ({
        ...prev,
        language: preferences.language,
        currency: preferences.currency,
        dateFormat: preferences.dateFormat,
      }));
      setInitialProfile((prev) => ({
        ...prev,
        language: preferences.language,
        currency: preferences.currency,
        dateFormat: preferences.dateFormat,
      }));
      setMode(preferences.theme);
      setSnackbar({
        open: true,
        message: "Preferences updated successfully!",
        severity: "success",
      });
    } catch (err) {
      setError("Failed to update preferences.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteAccountConfirm !== "DELETE") {
      setError("Please type 'DELETE' to confirm.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      setSnackbar({
        open: true,
        message: "Account deleted successfully!",
        severity: "success",
      });
      setDeleteAccountDialog(false);
      setDeleteAccountConfirm("");
    } catch (err) {
      setError("Failed to delete account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (property) => {
    const isAsc = sortBy === property && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortBy(property);
    setCategories(
      [...categories].sort((a, b) => {
        if (property === "name") {
          return isAsc
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name);
        }
        return 0;
      })
    );
  };

  const filteredCategories = categories.filter((cat) => {
    const isUniversal = !cat.userId || cat.userId === "None";
    const matchesSearch = cat.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (categoryFilter === "user")
      return !isUniversal && cat.userId === currentUserId && matchesSearch;
    if (categoryFilter === "universal") return isUniversal && matchesSearch;
    return matchesSearch;
  });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const canEditCategory = (cat) => {
    const isUniversal = !cat.userId || cat.userId === "None";
    return (
      cat.userId === currentUserId || (userRole === "admin" && isUniversal)
    );
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        backgroundColor: "background.default",
        minHeight: "100vh",
      }}
    >
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading || profileProgress > 0 || isReloading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: "bold" }}>
        Settings
      </Typography>
      {error && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Fade>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", md: 250 },
            flexShrink: 0,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
            p: 2,
          }}
        >
          <Tabs
            orientation="vertical"
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "medium",
                justifyContent: "flex-start",
                borderRadius: 1,
                mb: 1,
                "&:hover": {
                  bgcolor: (theme) => theme.palette.grey[200],
                },
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                },
              },
            }}
          >
            <Tab
              label="Profile"
              icon={<AccountCircleIcon />}
              iconPosition="start"
            />
            <Tab
              label="Categories"
              icon={<CategoryIcon />}
              iconPosition="start"
            />
            <Tab label="Preferences" icon={<TuneIcon />} iconPosition="start" />
            <Tab
              label="Danger Zone"
              icon={<WarningIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Fade in={tabValue === 0} timeout={300}>
            <Box sx={{ display: tabValue === 0 ? "block" : "none" }}>
              <Card
                sx={{
                  maxWidth: 900,
                  mx: "auto",
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: "bold", mb: 3 }}
                  >
                    Profile
                  </Typography>
                  <Box component="form" onSubmit={handleProfileUpdate}>
                    <Box
                      sx={{
                        mb: 4,
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: "background.paper",
                        boxShadow: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 3 }}
                      >
                        <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                          Personal Information
                        </Typography>
                      </Box>
                      <Grid container spacing={4}>
                        <Grid
                          item
                          xs={12}
                          sx={{ width: "100%", display: "block" }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              src={newImage || profile.image || null}
                              alt="Profile Image"
                              sx={{
                                width: 120,
                                height: 120,
                                border: "2px solid",
                                borderColor: "primary.main",
                              }}
                            />
                            <Box sx={{ display: "flex", gap: 2 }}>
                              <Button
                                variant="contained"
                                color="primary"
                                component="label"
                                startIcon={<UploadFileIcon />}
                                disabled={isLoading}
                                sx={{
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: 1,
                                  textTransform: "none",
                                  fontSize: "0.95rem",
                                  backgroundColor: "primary.main",
                                  "&:hover": {
                                    backgroundColor: "primary.dark",
                                  },
                                }}
                              >
                                Upload Image
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={handleImageUpload}
                                />
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                startIcon={<ClearIcon />}
                                onClick={handleRemoveImage}
                                disabled={
                                  isLoading || (!newImage && !profile.image)
                                }
                                sx={{
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: 1,
                                  textTransform: "none",
                                  fontSize: "0.95rem",
                                  backgroundColor: "error.main",
                                  "&:hover": { backgroundColor: "error.dark" },
                                }}
                              >
                                Remove Image
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sx={{ width: "100%", display: "block", mt: 2 }}
                        >
                          <TextField
                            label="Name"
                            value={profile.name}
                            onChange={(e) =>
                              setProfile({ ...profile, name: e.target.value })
                            }
                            fullWidth
                            margin="normal"
                            disabled={isLoading}
                            variant="outlined"
                            sx={{
                              "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                              "& .MuiOutlinedInput-root": { borderRadius: 1 },
                            }}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sx={{ width: "100%", display: "block" }}
                        >
                          <TextField
                            label="Email"
                            value={profile.email}
                            onChange={(e) =>
                              setProfile({ ...profile, email: e.target.value })
                            }
                            fullWidth
                            margin="normal"
                            disabled={isLoading}
                            type="email"
                            variant="outlined"
                            sx={{
                              "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                              "& .MuiOutlinedInput-root": { borderRadius: 1 },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Box
                      sx={{
                        mb: 4,
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: "background.paper",
                        boxShadow: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 3 }}
                      >
                        <LockIcon sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                          Change Password
                        </Typography>
                      </Box>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="New Password"
                            type="password"
                            value={profile.newPassword}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                newPassword: e.target.value,
                              })
                            }
                            fullWidth
                            margin="normal"
                            disabled={isLoading}
                            error={
                              profile.newPassword &&
                              profile.newPassword.length < 8
                            }
                            helperText={
                              profile.newPassword &&
                              profile.newPassword.length < 8
                                ? "Password must be at least 8 characters"
                                : ""
                            }
                            autoComplete="new-password"
                            variant="outlined"
                            sx={{
                              "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                              "& .MuiOutlinedInput-root": { borderRadius: 1 },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Confirm New Password"
                            type="password"
                            value={profile.confirmNewPassword}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                confirmNewPassword: e.target.value,
                              })
                            }
                            fullWidth
                            margin="normal"
                            disabled={isLoading}
                            error={
                              profile.newPassword &&
                              profile.confirmNewPassword &&
                              profile.newPassword !== profile.confirmNewPassword
                            }
                            helperText={
                              profile.newPassword &&
                              profile.confirmNewPassword &&
                              profile.newPassword !== profile.confirmNewPassword
                                ? "Passwords do not match"
                                : ""
                            }
                            autoComplete="new-password"
                            variant="outlined"
                            sx={{
                              "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                              "& .MuiOutlinedInput-root": { borderRadius: 1 },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {profileProgress > 0 && (
                      <Fade in={profileProgress > 0}>
                        <Box sx={{ mb: 3 }}>
                          <LinearProgress
                            variant="determinate"
                            value={profileProgress}
                            sx={{ transition: "value 0.3s ease" }}
                          />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            {profileStep}
                          </Typography>
                        </Box>
                      </Fade>
                    )}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleDiscardChanges}
                        disabled={
                          isLoading || profileProgress > 0 || !hasChanges
                        }
                        sx={{
                          px: 4,
                          py: 1,
                          borderRadius: 1,
                          textTransform: "none",
                          fontSize: "1rem",
                        }}
                      >
                        Discard Changes
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={
                          isLoading || profileProgress > 0 || !hasChanges
                        }
                        sx={{
                          px: 4,
                          py: 1,
                          borderRadius: 1,
                          textTransform: "none",
                          fontSize: "1rem",
                          "&:hover": {
                            backgroundColor: "primary.dark",
                          },
                        }}
                      >
                        {isLoading ? "Updating..." : "Save Changes"}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>

          <Fade in={tabValue === 1} timeout={300}>
            <Box sx={{ display: tabValue === 1 ? "block" : "none" }}>
              <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: "bold", mb: 3 }}
                  >
                    Category Management
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: 3,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <TextField
                      label="New Category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      fullWidth
                      disabled={isLoading}
                      variant="outlined"
                      sx={{
                        "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                        "& .MuiOutlinedInput-root": { borderRadius: 1 },
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddCategory}
                      disabled={isLoading}
                      sx={{
                        px: 4,
                        py: 1,
                        borderRadius: 1,
                        textTransform: "none",
                        fontSize: "1rem",
                        minWidth: { xs: "100%", sm: "auto" },
                      }}
                    >
                      {isLoading ? "Adding..." : "Add"}
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: 3,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Paper
                      component="form"
                      sx={{
                        p: "2px 4px",
                        display: "flex",
                        alignItems: "center",
                        width: { xs: "100%", sm: 300 },
                        borderRadius: 1,
                        bgcolor: "background.paper",
                      }}
                    >
                      <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search categories"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isLoading}
                      />
                      <IconButton sx={{ p: "10px" }} aria-label="search">
                        <SearchIcon />
                      </IconButton>
                    </Paper>
                    <FormControl sx={{ minWidth: { xs: "100%", sm: 200 } }}>
                      <InputLabel sx={{ fontSize: "0.95rem" }}>
                        Filter
                      </InputLabel>
                      <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        label="Filter"
                        sx={{ borderRadius: 1 }}
                        disabled={isLoading}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="user">User-Specific</MenuItem>
                        <MenuItem value="universal">Universal</MenuItem>
                      </Select>
                    </FormControl>
                    {selectedCategories.length > 0 && (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setBulkDeleteDialog(true)}
                        disabled={isLoading}
                        sx={{
                          px: 4,
                          py: 1,
                          borderRadius: 1,
                          textTransform: "none",
                          fontSize: "1rem",
                          minWidth: { xs: "100%", sm: "auto" },
                        }}
                      >
                        Delete Selected ({selectedCategories.length})
                      </Button>
                    )}
                  </Box>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Checkbox
                            checked={
                              selectedCategories.length ===
                              filteredCategories.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories(
                                  filteredCategories
                                    .filter((cat) => canEditCategory(cat))
                                    .map((cat) => cat.name)
                                );
                              } else {
                                setSelectedCategories([]);
                              }
                            }}
                            disabled={isLoading}
                          />
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={sortBy === "name"}
                            direction={
                              sortBy === "name" ? sortDirection : "asc"
                            }
                            onClick={() => handleSort("name")}
                          >
                            Category
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Ownership</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCategories.map((cat) => (
                        <TableRow
                          key={cat.name}
                          sx={{
                            "&:hover": {
                              bgcolor: (theme) => theme.palette.grey[100],
                            },
                          }}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedCategories.includes(cat.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategories([
                                    ...selectedCategories,
                                    cat.name,
                                  ]);
                                } else {
                                  setSelectedCategories(
                                    selectedCategories.filter(
                                      (name) => name !== cat.name
                                    )
                                  );
                                }
                              }}
                              disabled={isLoading || !canEditCategory(cat)}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              fontStyle:
                                cat.userId && cat.userId !== "None"
                                  ? "normal"
                                  : "italic",
                            }}
                          >
                            {cat.name}
                          </TableCell>
                          <TableCell>
                            {cat.userId && cat.userId !== "None"
                              ? "User-Specific"
                              : "Universal"}
                          </TableCell>
                          <TableCell>
                            {canEditCategory(cat) ? (
                              <>
                                <IconButton
                                  onClick={() => {
                                    setEditCategory(cat.name);
                                    setEditName(cat.name);
                                  }}
                                  disabled={isLoading}
                                  color="primary"
                                  aria-label={`Edit category ${cat.name}`}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  onClick={() =>
                                    setDeleteDialog({
                                      open: true,
                                      name: cat.name,
                                    })
                                  }
                                  disabled={isLoading}
                                  color="secondary"
                                  aria-label={`Delete category ${cat.name}`}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {userRole === "admin"
                                  ? "No actions available"
                                  : "Admin access required"}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Box>
          </Fade>

          <Fade in={tabValue === 2} timeout={300}>
            <Box sx={{ display: tabValue === 2 ? "block" : "none" }}>
              <Card
                sx={{
                  mb: 4,
                  boxShadow: 3,
                  borderRadius: 2,
                  maxWidth: 900,
                  mx: "auto",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <SettingsIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: "bold", mb: 0 }}
                    >
                      Preferences
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      mb: 4,
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: "background.paper",
                      boxShadow: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <PaletteIcon sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                        Appearance
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.theme === "dark"}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              theme: e.target.checked ? "dark" : "light",
                            })
                          }
                          color="primary"
                        />
                      }
                      label="Dark Mode"
                      sx={{ "& .MuiTypography-root": { fontSize: "0.95rem" } }}
                    />
                  </Box>

                  <Box
                    sx={{
                      mb: 4,
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: "background.paper",
                      boxShadow: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <LanguageIcon sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                        Regional Settings
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <FormControl sx={{ maxWidth: 300 }}>
                        <InputLabel sx={{ fontSize: "0.95rem" }}>
                          Language
                        </InputLabel>
                        <Select
                          value={preferences.language}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              language: e.target.value,
                            })
                          }
                          label="Language"
                          disabled={isLoading}
                          sx={{ borderRadius: 1, fontSize: "0.95rem" }}
                        >
                          <MenuItem value="English">English</MenuItem>
                          <MenuItem value="Spanish">Spanish</MenuItem>
                        </Select>
                      </FormControl>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          flexDirection: { xs: "column", sm: "row" },
                        }}
                      >
                        <FormControl sx={{ maxWidth: 300, width: "100%" }}>
                          <InputLabel sx={{ fontSize: "0.95rem" }}>
                            Currency
                          </InputLabel>
                          <Select
                            value={preferences.currency}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                currency: e.target.value,
                              })
                            }
                            label="Currency"
                            disabled={isLoading}
                            sx={{ borderRadius: 1, fontSize: "0.95rem" }}
                          >
                            <MenuItem value="USD">USD</MenuItem>
                            <MenuItem value="EUR">EUR</MenuItem>
                            <MenuItem value="GBP">GBP</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl sx={{ maxWidth: 300, width: "100%" }}>
                          <InputLabel sx={{ fontSize: "0.95rem" }}>
                            Date Format
                          </InputLabel>
                          <Select
                            value={preferences.dateFormat}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                dateFormat: e.target.value,
                              })
                            }
                            label="Date Format"
                            disabled={isLoading}
                            sx={{ borderRadius: 1, fontSize: "0.95rem" }}
                          >
                            <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                            <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                            <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      mb: 4,
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: "background.paper",
                      boxShadow: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <NotificationsIcon
                        sx={{ mr: 1, color: "primary.main" }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                        Notifications
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notifications}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              notifications: e.target.checked,
                            })
                          }
                          color="primary"
                        />
                      }
                      label="Enable Email Notifications"
                      sx={{ "& .MuiTypography-root": { fontSize: "0.95rem" } }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handlePreferencesUpdate}
                      disabled={isLoading}
                      sx={{
                        px: 4,
                        py: 1,
                        borderRadius: 1,
                        textTransform: "none",
                        fontSize: "1rem",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                      }}
                    >
                      {isLoading ? "Saving..." : "Save Preferences"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>

          <Fade in={tabValue === 3} timeout={300}>
            <Box sx={{ display: tabValue === 3 ? "block" : "none" }}>
              <Card
                sx={{
                  mb: 4,
                  border: "1px solid",
                  borderColor: "error.main",
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    color="error"
                    sx={{ fontWeight: "bold", mb: 3 }}
                  >
                    Danger Zone
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      Delete your account and all associated data.
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setDeleteAccountDialog(true)}
                      disabled={isLoading}
                      startIcon={<WarningIcon />}
                      sx={{
                        px: 4,
                        py: 1,
                        borderRadius: 1,
                        textTransform: "none",
                        fontSize: "1rem",
                      }}
                    >
                      Delete Account
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        </Box>
      </Box>

      <Dialog
        open={editCategory !== null}
        onClose={() => setEditCategory(null)}
      >
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            label="Category Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{
              "& .MuiInputLabel-root": { fontSize: "0.95rem" },
              "& .MuiOutlinedInput-root": { borderRadius: 1 },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditCategory(null)}
            color="primary"
            sx={{ textTransform: "none", fontSize: "1rem" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditCategory}
            variant="contained"
            color="primary"
            sx={{ textTransform: "none", fontSize: "1rem" }}
          >
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
          <Button
            onClick={() => setDeleteDialog({ open: false, name: "" })}
            color="primary"
            sx={{ textTransform: "none", fontSize: "1rem" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteCategory}
            variant="contained"
            color="secondary"
            sx={{ textTransform: "none", fontSize: "1rem" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={bulkDeleteDialog}
        onClose={() => setBulkDeleteDialog(false)}
      >
        <DialogTitle>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedCategories.length} selected
            categories? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setBulkDeleteDialog(false)}
            color="primary"
            sx={{ textTransform: "none", fontSize: "1rem" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkDelete}
            variant="contained"
            color="error"
            sx={{ textTransform: "none", fontSize: "1rem" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteAccountDialog}
        onClose={() => setDeleteAccountDialog(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography color="error" gutterBottom>
            This action cannot be undone. All your data will be permanently
            deleted.
          </Typography>
          <Typography gutterBottom>Type 'DELETE' to confirm.</Typography>
          <TextField
            label="Confirmation"
            value={deleteAccountConfirm}
            onChange={(e) => setDeleteAccountConfirm(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{
              "& .MuiInputLabel-root": { fontSize: "0.95rem" },
              "& .MuiOutlinedInput-root": { borderRadius: 1 },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteAccountDialog(false)}
            color="primary"
            sx={{ textTransform: "none", fontSize: "1rem" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            color="error"
            disabled={isLoading}
            sx={{ textTransform: "none", fontSize: "1rem" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Settings;

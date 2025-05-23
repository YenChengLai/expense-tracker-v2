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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Fade,
  Collapse,
  CircularProgress,
  Paper,
  InputBase,
  Chip,
  TableSortLabel,
  Snackbar,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

function Expenses({ token }) {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newRecord, setNewRecord] = useState({
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    type: "Expense",
  });
  const [editRecord, setEditRecord] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
    type: "",
  });
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Debounce filter updates to prevent rapid API calls
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await axios.get("http://127.0.0.1:8001/categories", {
          headers: { Authorization: `Bearer ${token}` },
          params: { show_universal: true },
        });
        console.log("Categories API Response:", response.data);
        const fetchedCategories = Array.isArray(response.data)
          ? response.data
          : [];
        setCategories(fetchedCategories);
      } catch (err) {
        console.error("Fetch Categories Error:", {
          message: err.message,
          response: err.response
            ? {
                status: err.response.status,
                data: err.response.data,
              }
            : null,
          request: err.request ? err.request : null,
        });
        setError(err.response?.data?.detail || "Failed to load categories.");
        setCategories([]);
      }
    };

    const fetchExpenses = async () => {
      setIsLoading(true);
      setError("");
      try {
        const params = {};
        if (filters.startDate) params.date_gte = filters.startDate;
        if (filters.endDate) params.date_lte = filters.endDate;
        if (filters.category) params.category = filters.category;
        if (filters.type) params.type = filters.type;
        console.log("Fetch Expenses Params:", params);

        const response = await axios.get("http://127.0.0.1:8001/expense", {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        console.log("Expenses API Response:", response.data);
        const fetchedExpenses = Array.isArray(response.data)
          ? response.data
          : [];
        setExpenses(fetchedExpenses);
        setSelectedExpenses([]); // Reset selections on filter change
      } catch (err) {
        console.error("Fetch Expenses Error:", {
          message: err.message,
          response: err.response
            ? {
                status: err.response.status,
                data: err.response.data,
              }
            : null,
          request: err.request ? err.request : null,
        });
        setError(err.response?.data?.detail || "Failed to load expenses.");
        setExpenses([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchCategories();
      fetchExpenses();
    }, 300);

    return () => clearTimeout(timer);
  }, [token, filters]);

  const handleAddRecord = async () => {
    if (!newRecord.amount || !newRecord.category || !newRecord.date) {
      setError("Amount, category, and date are required.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "http://127.0.0.1:8001/expense",
        { ...newRecord, amount: parseFloat(newRecord.amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Add Expense Response:", response);
      if (
        response.status >= 200 &&
        response.status < 300 &&
        response.data &&
        typeof response.data === "object"
      ) {
        setExpenses([...expenses, response.data]);
        setNewRecord({
          amount: "",
          category: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
          type: "Expense",
        });
        setDialogOpen(false);
        setSnackbar({
          open: true,
          message: "Expense added successfully!",
          severity: "success",
        });
        setTimeout(() => setError(""), 100);
      } else {
        throw new Error(`Unexpected response: ${response.status}`);
      }
    } catch (err) {
      console.error("Add Expense Error:", {
        message: err.message,
        response: err.response
          ? {
              status: err.response.status,
              data: err.response.data,
            }
          : null,
        request: err.request ? err.request : null,
      });
      if (err.response && err.response.status >= 400) {
        setError(err.response?.data?.detail || "Failed to add expense.");
      } else {
        setError("Unexpected error adding expense.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRecord = async () => {
    if (!editRecord.amount || !editRecord.category || !editRecord.date) {
      setError("Amount, category, and date are required.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.put(
        `http://127.0.0.1:8001/expense/${editRecord.id}`,
        { ...editRecord, amount: parseFloat(editRecord.amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpenses(
        expenses.map((exp) => (exp.id === editRecord.id ? response.data : exp))
      );
      setEditRecord(null);
      setDialogOpen(false);
      setSnackbar({
        open: true,
        message: "Expense updated successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Edit Expense Error:", {
        message: err.message,
        response: err.response
          ? {
              status: err.response.status,
              data: err.response.data,
            }
          : null,
        request: err.request ? err.request : null,
      });
      setError(err.response?.data?.detail || "Failed to update expense.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async () => {
    setIsLoading(true);
    setError("");
    try {
      await axios.delete(`http://127.0.0.1:8001/expense/${deleteDialog.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(expenses.filter((exp) => exp.id !== deleteDialog.id));
      setDeleteDialog({ open: false, id: null });
      setSnackbar({
        open: true,
        message: "Expense deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Delete Expense Error:", {
        message: err.message,
        response: err.response
          ? {
              status: err.response.status,
              data: err.response.data,
            }
          : null,
        request: err.request ? err.request : null,
      });
      setError(err.response?.data?.detail || "Failed to delete expense.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsLoading(true);
    setError("");
    try {
      for (const id of selectedExpenses) {
        await axios.delete(`http://127.0.0.1:8001/expense/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setExpenses(expenses.filter((exp) => !selectedExpenses.includes(exp.id)));
      setSelectedExpenses([]);
      setBulkDeleteDialog(false);
      setSnackbar({
        open: true,
        message: "Selected expenses deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Bulk Delete Error:", {
        message: err.message,
        response: err.response
          ? {
              status: err.response.status,
              data: err.response.data,
            }
          : null,
        request: err.request ? err.request : null,
      });
      setError(err.response?.data?.detail || "Failed to delete expenses.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (property) => {
    const isAsc = sortBy === property && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortBy(property);
    setExpenses(
      [...expenses].sort((a, b) => {
        if (property === "amount") {
          return isAsc ? a.amount - b.amount : b.amount - a.amount;
        }
        if (property === "date") {
          return isAsc
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        if (property === "category") {
          return isAsc
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        }
        return 0;
      })
    );
  };

  const filteredExpenses = useMemo(() => {
    if (!Array.isArray(expenses)) {
      console.warn("Expenses is not an array:", expenses);
      return [];
    }
    return expenses.filter((exp) =>
      `${exp.description || ""} ${exp.category}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [expenses, searchQuery]);

  const handleResetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      category: "",
      type: "",
    });
    setSearchQuery("");
  };

  const activeFilters = useMemo(() => {
    const count = Object.values(filters).filter((val) => val !== "").length;
    return count > 0 ? count : null;
  }, [filters]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        backgroundColor: "background.default",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: "bold" }}>
        Expenses
      </Typography>
      {error && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Fade>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={isLoading || categories.length === 0}
          sx={{
            mb: 2,
            px: 4,
            py: 1,
            borderRadius: 1,
            textTransform: "none",
            fontSize: "1rem",
            "&:hover": { backgroundColor: "primary.dark" },
          }}
        >
          Add Record
        </Button>
      </Box>

      <Card
        sx={{
          mb: 3,
          boxShadow: 3,
          borderRadius: 2,
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "medium" }}>
              Filters
              {activeFilters && (
                <Chip
                  label={`${activeFilters} active`}
                  color="primary"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <IconButton onClick={() => setFilterOpen(!filterOpen)}>
              <FilterListIcon />
            </IconButton>
          </Box>
          <Collapse in={filterOpen}>
            <Grid container spacing={4} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  disabled={isLoading}
                  variant="outlined"
                  sx={{
                    "& .MuiInputLabel-root": { fontSize: "1rem" },
                    "& .MuiOutlinedInput-root": { borderRadius: 1, height: 56 },
                    my: 1,
                  }}
                  inputProps={{ "aria-label": "Start Date" }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="End Date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  disabled={isLoading}
                  variant="outlined"
                  sx={{
                    "& .MuiInputLabel-root": { fontSize: "1rem" },
                    "& .MuiOutlinedInput-root": { borderRadius: 1, height: 56 },
                    my: 1,
                  }}
                  inputProps={{ "aria-label": "End Date" }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  disabled={isLoading || categories.length === 0}
                  sx={{ minWidth: 200, my: 1 }}
                >
                  <InputLabel sx={{ fontSize: "1rem" }}>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    label="Category"
                    sx={{ borderRadius: 1, height: 56 }}
                    inputProps={{ "aria-label": "Category Filter" }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((cat) => (
                        <MenuItem key={cat.name} value={cat.name}>
                          {cat.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No categories available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  disabled={isLoading}
                  sx={{ minWidth: 200, my: 1 }}
                >
                  <InputLabel sx={{ fontSize: "1rem" }}>Type</InputLabel>
                  <Select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                    label="Type"
                    sx={{ borderRadius: 1, height: 56 }}
                    inputProps={{ "aria-label": "Type Filter" }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Expense">Expense</MenuItem>
                    <MenuItem value="Income">Income</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ClearIcon />}
                  onClick={handleResetFilters}
                  disabled={isLoading}
                  sx={{
                    px: 4,
                    py: 1,
                    borderRadius: 1,
                    textTransform: "none",
                    fontSize: "1rem",
                  }}
                >
                  Reset Filters
                </Button>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      <Card
        sx={{
          boxShadow: 3,
          borderRadius: 2,
          mb: 3,
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
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
                placeholder="Search expenses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
                inputProps={{ "aria-label": "Search expenses" }}
              />
              <IconButton sx={{ p: "10px" }} aria-label="search">
                <SearchIcon />
              </IconButton>
            </Paper>
            {selectedExpenses.length > 0 && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setBulkDeleteDialog(true)}
                disabled={isLoading}
                sx={{
                  ml: 2,
                  px: 4,
                  py: 1,
                  borderRadius: 1,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Delete Selected ({selectedExpenses.length})
              </Button>
            )}
          </Box>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead
                    sx={{
                      position: "sticky",
                      top: 0,
                      bgcolor: "background.paper",
                      zIndex: 1,
                    }}
                  >
                    <TableRow>
                      <TableCell>
                        <Checkbox
                          checked={
                            selectedExpenses.length ===
                              filteredExpenses.length &&
                            filteredExpenses.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedExpenses(
                                filteredExpenses.map((exp) => exp.id)
                              );
                            } else {
                              setSelectedExpenses([]);
                            }
                          }}
                          disabled={isLoading}
                          inputProps={{ "aria-label": "Select all expenses" }}
                        />
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === "amount"}
                          direction={
                            sortBy === "amount" ? sortDirection : "asc"
                          }
                          onClick={() => handleSort("amount")}
                        >
                          Amount
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === "category"}
                          direction={
                            sortBy === "category" ? sortDirection : "asc"
                          }
                          onClick={() => handleSort("category")}
                        >
                          Category
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === "date"}
                          direction={sortBy === "date" ? sortDirection : "asc"}
                          onClick={() => handleSort("date")}
                        >
                          Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(filteredExpenses) &&
                    filteredExpenses.length > 0 ? (
                      filteredExpenses.map((expense) => (
                        <TableRow
                          key={expense.id}
                          sx={{
                            "&:hover": {
                              bgcolor: (theme) => theme.palette.grey[100],
                            },
                          }}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedExpenses.includes(expense.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedExpenses([
                                    ...selectedExpenses,
                                    expense.id,
                                  ]);
                                } else {
                                  setSelectedExpenses(
                                    selectedExpenses.filter(
                                      (id) => id !== expense.id
                                    )
                                  );
                                }
                              }}
                              disabled={isLoading}
                              inputProps={{
                                "aria-label": `Select expense ${expense.id}`,
                              }}
                            />
                          </TableCell>
                          <TableCell>{expense.amount.toFixed(2)}</TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>
                            {new Date(expense.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{expense.description || "N/A"}</TableCell>
                          <TableCell>
                            <Chip
                              label={expense.type}
                              color={
                                expense.type === "Expense" ? "error" : "success"
                              }
                              size="small"
                              sx={{ fontWeight: "medium" }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => {
                                setEditRecord({
                                  ...expense,
                                  amount: expense.amount.toString(),
                                });
                                setDialogOpen(true);
                              }}
                              disabled={isLoading}
                              color="primary"
                              aria-label={`Edit expense ${expense.id}`}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() =>
                                setDeleteDialog({ open: true, id: expense.id })
                              }
                              disabled={isLoading}
                              color="secondary"
                              aria-label={`Delete expense ${expense.id}`}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No expenses found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
              <Box sx={{ display: { xs: "block", sm: "none" } }}>
                {Array.isArray(filteredExpenses) &&
                filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
                    <Card
                      key={expense.id}
                      sx={{
                        mb: 2,
                        boxShadow: 2,
                        borderRadius: 2,
                        "&:hover": {
                          bgcolor: (theme) => theme.palette.grey[50],
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Checkbox
                            checked={selectedExpenses.includes(expense.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExpenses([
                                  ...selectedExpenses,
                                  expense.id,
                                ]);
                              } else {
                                setSelectedExpenses(
                                  selectedExpenses.filter(
                                    (id) => id !== expense.id
                                  )
                                );
                              }
                            }}
                            disabled={isLoading}
                            inputProps={{
                              "aria-label": `Select expense ${expense.id}`,
                            }}
                          />
                          <Chip
                            label={expense.type}
                            color={
                              expense.type === "Expense" ? "error" : "success"
                            }
                            size="small"
                            sx={{ fontWeight: "medium" }}
                          />
                        </Box>
                        <Typography variant="body2">
                          <strong>Amount:</strong> ${expense.amount.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Category:</strong> {expense.category}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Date:</strong>{" "}
                          {new Date(expense.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Description:</strong>{" "}
                          {expense.description || "N/A"}
                        </Typography>
                        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => {
                              setEditRecord({
                                ...expense,
                                amount: expense.amount.toString(),
                              });
                              setDialogOpen(true);
                            }}
                            disabled={isLoading}
                            size="small"
                            sx={{ textTransform: "none" }}
                            aria-label={`Edit expense ${expense.id}`}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<DeleteIcon />}
                            onClick={() =>
                              setDeleteDialog({ open: true, id: expense.id })
                            }
                            disabled={isLoading}
                            size="small"
                            sx={{ textTransform: "none" }}
                            aria-label={`Delete expense ${expense.id}`}
                          >
                            Delete
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      No expenses found.
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditRecord(null);
          setNewRecord({
            amount: "",
            category: "",
            date: new Date().toISOString().split("T")[0],
            description: "",
            type: "Expense",
          });
          setError("");
        }}
        TransitionComponent={Fade}
        transitionDuration={300}
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": {
            width: { xs: "90%", sm: 600 },
            maxWidth: 800,
          },
        }}
      >
        <DialogTitle>{editRecord ? "Edit Record" : "Add Record"}</DialogTitle>
        <DialogContent sx={{ p: 4, minHeight: 400 }}>
          <Grid container spacing={4} direction="column">
            <Grid item xs={12}>
              <TextField
                label="Amount"
                value={editRecord ? editRecord.amount : newRecord.amount}
                onChange={(e) =>
                  editRecord
                    ? setEditRecord({ ...editRecord, amount: e.target.value })
                    : setNewRecord({ ...newRecord, amount: e.target.value })
                }
                fullWidth
                type="number"
                disabled={isLoading}
                error={editRecord ? !editRecord.amount : !newRecord.amount}
                helperText={
                  editRecord
                    ? !editRecord.amount
                      ? "Amount is required"
                      : ""
                    : !newRecord.amount
                    ? "Amount is required"
                    : ""
                }
                variant="outlined"
                sx={{
                  "& .MuiInputLabel-root": { fontSize: "1rem" },
                  "& .MuiOutlinedInput-root": { borderRadius: 1, height: 56 },
                  my: 1,
                }}
                inputProps={{ "aria-label": "Amount" }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl
                fullWidth
                disabled={isLoading || categories.length === 0}
                sx={{ my: 1 }}
              >
                <InputLabel sx={{ fontSize: "1rem" }}>Category</InputLabel>
                <Select
                  value={editRecord ? editRecord.category : newRecord.category}
                  onChange={(e) =>
                    editRecord
                      ? setEditRecord({
                          ...editRecord,
                          category: e.target.value,
                        })
                      : setNewRecord({
                          ...newRecord,
                          category: e.target.value,
                        })
                  }
                  label="Category"
                  error={
                    editRecord ? !editRecord.category : !newRecord.category
                  }
                  sx={{ borderRadius: 1, height: 56 }}
                  inputProps={{ "aria-label": "Category" }}
                >
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((cat) => (
                      <MenuItem key={cat.name} value={cat.name}>
                        {cat.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No categories available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Date"
                type="date"
                value={editRecord ? editRecord.date : newRecord.date}
                onChange={(e) =>
                  editRecord
                    ? setEditRecord({ ...editRecord, date: e.target.value })
                    : setNewRecord({ ...newRecord, date: e.target.value })
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={isLoading}
                error={editRecord ? !editRecord.date : !newRecord.date}
                helperText={
                  editRecord
                    ? !editRecord.date
                      ? "Date is required"
                      : ""
                    : !newRecord.date
                    ? "Date is required"
                    : ""
                }
                variant="outlined"
                sx={{
                  "& .MuiInputLabel-root": { fontSize: "1rem" },
                  "& .MuiOutlinedInput-root": { borderRadius: 1, height: 56 },
                  my: 1,
                }}
                inputProps={{ "aria-label": "Date" }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth disabled={isLoading} sx={{ my: 1 }}>
                <InputLabel sx={{ fontSize: "1rem" }}>Type</InputLabel>
                <Select
                  value={editRecord ? editRecord.type : newRecord.type}
                  onChange={(e) =>
                    editRecord
                      ? setEditRecord({ ...editRecord, type: e.target.value })
                      : setNewRecord({ ...newRecord, type: e.target.value })
                  }
                  label="Type"
                  sx={{ borderRadius: 1, height: 56 }}
                  inputProps={{ "aria-label": "Type" }}
                >
                  <MenuItem value="Expense">Expense</MenuItem>
                  <MenuItem value="Income">Income</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={
                  editRecord ? editRecord.description : newRecord.description
                }
                onChange={(e) =>
                  editRecord
                    ? setEditRecord({
                        ...editRecord,
                        description: e.target.value,
                      })
                    : setNewRecord({
                        ...newRecord,
                        description: e.target.value,
                      })
                }
                fullWidth
                multiline
                rows={4}
                disabled={isLoading}
                variant="outlined"
                sx={{
                  "& .MuiInputLabel-root": { fontSize: "1rem" },
                  "& .MuiOutlinedInput-root": { borderRadius: 1 },
                  my: 1,
                }}
                inputProps={{ "aria-label": "Description" }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              setEditRecord(null);
              setNewRecord({
                amount: "",
                category: "",
                date: new Date().toISOString().split("T")[0],
                description: "",
                type: "Expense",
              });
              setError("");
            }}
            color="primary"
            sx={{ textTransform: "none", fontSize: "1rem" }}
          >
            Cancel
          </Button>
          <Button
            onClick={editRecord ? handleEditRecord : handleAddRecord}
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={{ textTransform: "none", fontSize: "1rem" }}
          >
            {editRecord ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
      >
        <DialogTitle>Delete Expense</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this expense?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, id: null })}
            color="primary"
            sx={{ textTransform: "none", fontSize: "1rem" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteRecord}
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
            Are you sure you want to delete {selectedExpenses.length} selected
            expenses? This action cannot be undone.
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

export default Expenses;

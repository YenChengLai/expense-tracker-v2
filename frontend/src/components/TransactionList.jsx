import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Box,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TransactionForm from "./TransactionForm";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { DateTime } from "luxon";

// Import Inter font from Google Fonts in your index.html or via a CSS import
// Add this to your index.html: <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

function TransactionList({ token, refreshKey, onRecordUpdated }) {
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [editRecord, setEditRecord] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const params = {};
        if (dateRange.start) params.start_date = dateRange.start.toISODate();
        if (dateRange.end) params.end_date = dateRange.end.toISODate();
        const [recordResponse, categoryResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8001/expense", {
            headers: { Authorization: `Bearer ${token}` },
            params,
          }),
          axios.get("http://127.0.0.1:8001/categories", {
            headers: { Authorization: `Bearer ${token}` },
            params: { show_universal: true },
          }),
        ]);
        setRecords(recordResponse.data);
        setCategories(categoryResponse.data.map((cat) => cat.name) || []);
        applyFilterAndSort(recordResponse.data, selectedCategories, selectedType, sortField, sortDirection, search);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load data. Please check your connection or login again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, refreshKey, dateRange]);

  const applyFilterAndSort = (data, selectedCats, type, field, direction, searchTerm) => {
    let filtered = data;
    if (selectedCats.length > 0) {
      filtered = filtered.filter((rec) => selectedCats.includes(rec.category));
    }
    if (type !== "all") {
      filtered = filtered.filter((rec) => rec.type === type);
    }
    if (searchTerm) {
      filtered = filtered.filter((rec) =>
        [rec.description, rec.category].some((val) =>
          val?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    const sorted = [...filtered].sort((a, b) => {
      const aValue = field === "amount" ? a.amount : a.date;
      const bValue = field === "amount" ? b.amount : b.date;
      return direction === "asc" ? (aValue < bValue ? -1 : 1) : (bValue < aValue ? -1 : 1);
    });
    setFilteredRecords(sorted);
  };

  const handleCategoryChange = (category) => {
    const newSelected = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newSelected);
    applyFilterAndSort(records, newSelected, selectedType, sortField, sortDirection, search);
  };

  const handleTypeChange = (event) => {
    const newType = event.target.value;
    setSelectedType(newType);
    applyFilterAndSort(records, selectedCategories, newType, sortField, sortDirection, search);
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === "asc";
    const newDirection = isAsc ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    applyFilterAndSort(records, selectedCategories, selectedType, field, newDirection, search);
  };

  const handleRecordAction = async (payload, isEdit = false, recordId = null) => {
    setIsLoading(true);
    setError("");
    try {
      let response;
      if (isEdit && recordId) {
        response = await axios.put(
          `http://127.0.0.1:8001/expense/${recordId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(
          "http://127.0.0.1:8001/expense",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      const updatedRecords = isEdit
        ? records.map((rec) => (rec.id === recordId ? response.data : rec))
        : [...records, response.data];
      setRecords(updatedRecords);
      applyFilterAndSort(updatedRecords, selectedCategories, selectedType, sortField, sortDirection, search);
      if (isEdit) {
        setEditRecord(null);
      }
      onRecordUpdated(isEdit ? "Record updated successfully!" : "Record added successfully!");
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.detail || `Failed to ${isEdit ? "update" : "add"} record`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async () => {
    setIsLoading(true);
    setError("");
    console.log("Deleting record with ID:", deleteId);
    try {
      await axios.delete(
        `http://127.0.0.1:8001/expense/${deleteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedRecords = records.filter((rec) => rec.id !== deleteId);
      setRecords(updatedRecords);
      applyFilterAndSort(updatedRecords, selectedCategories, selectedType, sortField, sortDirection, search);
      setDeleteId(null);
      onRecordUpdated("Record deleted successfully!");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRecord = (rec) => {
    const parsedDate = DateTime.fromISO(rec.date, { zone: "utc" });
    if (!parsedDate.isValid) {
      console.error("Invalid date format:", rec.date);
      setError("Invalid date format in record. Please check the data.");
      return;
    }
    setEditRecord({
      ...rec,
      date: parsedDate,
    });
  };

  // Calculate summary metrics for the dashboard
  const totalExpenses = filteredRecords
    .filter((rec) => rec.type === "expense")
    .reduce((sum, rec) => sum + rec.amount, 0);
  const totalIncome = filteredRecords
    .filter((rec) => rec.type === "income")
    .reduce((sum, rec) => sum + rec.amount, 0);

  return (
    <Box sx={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#f4f7fa", minHeight: "100vh", p: 4 }}>
      <Card sx={{ borderRadius: 4, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.05)" }}>
        <CardContent sx={{ backgroundColor: "#ffffff" }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "#2d3748" }}>
            Expense Dashboard
          </Typography>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ borderRadius: 3, backgroundColor: "#e6fffa", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: "#4a5568", fontWeight: 500 }}>
                    Total Income
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#2b6cb0", fontWeight: 600 }}>
                    {totalIncome.toFixed(2)} USD
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ borderRadius: 3, backgroundColor: "#fefcbf", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: "#4a5568", fontWeight: 500 }}>
                    Total Expenses
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#c53030", fontWeight: 600 }}>
                    {totalExpenses.toFixed(2)} USD
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#2d3748", mt: 2 }}>
            Your Records
          </Typography>
          <TextField
            label="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              applyFilterAndSort(records, selectedCategories, selectedType, sortField, sortDirection, e.target.value);
            }}
            sx={{ mb: 3, backgroundColor: "#fff", borderRadius: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            fullWidth
          />
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: "#4a5568", fontWeight: 500 }}>
                    Filter by Category
                  </Typography>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <FormControlLabel
                        key={category}
                        control={
                          <Checkbox
                            checked={selectedCategories.includes(category)}
                            onChange={() => handleCategoryChange(category)}
                            sx={{ color: "#a0aec0", "&.Mui-checked": { color: "#2b6cb0" } }}
                          />
                        }
                        label={category}
                        sx={{ color: "#4a5568" }}
                      />
                    ))
                  ) : (
                    <Typography color="text.secondary">No categories available.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}>
                <CardContent>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ color: "#4a5568" }}>Record Type</InputLabel>
                    <Select
                      value={selectedType}
                      label="Record Type"
                      onChange={handleTypeChange}
                      sx={{ backgroundColor: "#fff", borderRadius: 2 }}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="expense">Expense</MenuItem>
                      <MenuItem value="income">Income</MenuItem>
                    </Select>
                  </FormControl>
                  <LocalizationProvider dateAdapter={AdapterLuxon}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <DatePicker
                        label="Start Date"
                        value={dateRange.start}
                        onChange={(newValue) => setDateRange({ ...dateRange, start: newValue })}
                        slotProps={{ textField: { size: "small", sx: { backgroundColor: "#fff", borderRadius: 2 } } }}
                      />
                      <DatePicker
                        label="End Date"
                        value={dateRange.end}
                        onChange={(newValue) => setDateRange({ ...dateRange, end: newValue })}
                        slotProps={{ textField: { size: "small", sx: { backgroundColor: "#fff", borderRadius: 2 } } }}
                      />
                    </Box>
                  </LocalizationProvider>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {isLoading && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress />
            </Box>
          )}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {!isLoading && filteredRecords.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No records match the filter.
            </Typography>
          ) : (
            <Table sx={{ backgroundColor: "#fff", borderRadius: 2, overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#edf2f7" }}>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === "amount"}
                      direction={sortField === "amount" ? sortDirection : "asc"}
                      onClick={() => handleSort("amount")}
                      sx={{ fontWeight: 600, color: "#2d3748" }}
                    >
                      Amount
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#2d3748" }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#2d3748" }}>Type</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === "date"}
                      direction={sortField === "date" ? sortDirection : "asc"}
                      onClick={() => handleSort("date")}
                      sx={{ fontWeight: 600, color: "#2d3748" }}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#2d3748" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#2d3748" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map((rec) => (
                  <TableRow key={rec.id} sx={{ "&:hover": { backgroundColor: "#f7fafc" } }}>
                    <TableCell sx={{ color: rec.type === "expense" ? "#c53030" : "#2b6cb0", fontWeight: 500 }}>
                      {rec.amount} {rec.currency}
                    </TableCell>
                    <TableCell sx={{ color: "#4a5568" }}>{rec.category}</TableCell>
                    <TableCell sx={{ color: "#4a5568" }}>
                      {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                    </TableCell>
                    <TableCell sx={{ color: "#4a5568" }}>{rec.date}</TableCell>
                    <TableCell sx={{ color: "#4a5568" }}>{rec.description || "-"}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEditRecord(rec)}
                        disabled={isLoading}
                        sx={{ color: "#2b6cb0", "&:hover": { color: "#2c5282" } }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => setDeleteId(rec.id)}
                        disabled={isLoading}
                        sx={{ color: "#c53030", "&:hover": { color: "#9b2c2c" } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Dialog open={editRecord !== null} onClose={() => setEditRecord(null)} sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}>
            <DialogTitle sx={{ backgroundColor: "#edf2f7", color: "#2d3748", fontWeight: 600 }}>
              Edit Record
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: "#f7fafc", py: 3 }}>
              {editRecord && (
                <TransactionForm
                  token={token}
                  onRecordAdded={(payload) => handleRecordAction(payload, true, editRecord.id)}
                  initialData={editRecord}
                />
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}>
            <DialogTitle sx={{ backgroundColor: "#edf2f7", color: "#2d3748", fontWeight: 600 }}>
              Confirm Delete
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: "#f7fafc", py: 3 }}>
              <Typography sx={{ color: "#4a5568" }}>
                Are you sure you want to delete this record?
              </Typography>
            </DialogContent>
            <DialogActions sx={{ backgroundColor: "#f7fafc", py: 2 }}>
              <Button onClick={() => setDeleteId(null)} sx={{ color: "#718096", "&:hover": { backgroundColor: "#edf2f7" } }}>
                Cancel
              </Button>
              <Button onClick={handleDeleteRecord} sx={{ color: "#c53030", "&:hover": { backgroundColor: "#fefcbf" } }}>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Box>
  );
}

export default TransactionList;
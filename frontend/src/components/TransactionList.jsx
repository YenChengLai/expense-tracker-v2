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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TransactionForm from "./TransactionForm";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { DateTime } from "luxon";

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
            params: { show_universal: true }, // Include universal categories
          }),
        ]);
        setRecords(recordResponse.data);
        setCategories(categoryResponse.data.map(cat => cat.name) || []);
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
        ? records.map((rec) => (rec._id === recordId ? response.data : rec))
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
    try {
      await axios.delete(
        `http://127.0.0.1:8001/expense/${deleteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedRecords = records.filter((rec) => rec._id !== deleteId);
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

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Records
        </Typography>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            applyFilterAndSort(records, selectedCategories, selectedType, sortField, sortDirection, e.target.value);
          }}
          sx={{ mb: 2 }}
          fullWidth
        />
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
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
                  />
                }
                label={category}
              />
            ))
          ) : (
            <Typography color="text.secondary">No categories available.</Typography>
          )}
        </Box>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Record Type</InputLabel>
          <Select
            value={selectedType}
            label="Record Type"
            onChange={handleTypeChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
            <MenuItem value="income">Income</MenuItem>
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <DatePicker
              label="Start Date"
              value={dateRange.start}
              onChange={(newValue) => setDateRange({ ...dateRange, start: newValue })}
              slotProps={{ textField: { size: "small" } }}
            />
            <DatePicker
              label="End Date"
              value={dateRange.end}
              onChange={(newValue) => setDateRange({ ...dateRange, end: newValue })}
              slotProps={{ textField: { size: "small" } }}
            />
          </Box>
        </LocalizationProvider>
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
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === "amount"}
                    direction={sortField === "amount" ? sortDirection : "asc"}
                    onClick={() => handleSort("amount")}
                  >
                    Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === "date"}
                    direction={sortField === "date" ? sortDirection : "asc"}
                    onClick={() => handleSort("date")}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((rec) => (
                <TableRow key={rec._id}>
                  <TableCell>{rec.amount} {rec.currency}</TableCell>
                  <TableCell>{rec.category}</TableCell>
                  <TableCell>{rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}</TableCell>
                  <TableCell>{rec.date}</TableCell>
                  <TableCell>{rec.description || "-"}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => setEditRecord(rec)}
                      disabled={isLoading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => setDeleteId(rec._id)}
                      disabled={isLoading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Dialog open={editRecord !== null} onClose={() => setEditRecord(null)}>
          <DialogTitle>Edit Record</DialogTitle>
          <DialogContent>
            {editRecord && (
              <TransactionForm
                token={token}
                onRecordAdded={(payload) => handleRecordAction(payload, true, editRecord._id)}
                initialData={editRecord}
              />
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this record?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button onClick={handleDeleteRecord} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default TransactionList;
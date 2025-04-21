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
} from "@mui/material";

function TransactionList({ token, refreshKey }) {
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [recordResponse, categoryResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8001/expense", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://127.0.0.1:8001/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setRecords(recordResponse.data);
        setCategories(categoryResponse.data);
        applyFilterAndSort(recordResponse.data, selectedCategories, selectedType, sortField, sortDirection);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, refreshKey]);

  const applyFilterAndSort = (data, selectedCats, type, field, direction) => {
    let filtered = data;
    if (selectedCats.length > 0) {
      filtered = filtered.filter((rec) => selectedCats.includes(rec.category));
    }
    if (type !== "all") {
      filtered = filtered.filter((rec) => rec.type === type);
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
    applyFilterAndSort(records, newSelected, selectedType, sortField, sortDirection);
  };

  const handleTypeChange = (event) => {
    const newType = event.target.value;
    setSelectedType(newType);
    applyFilterAndSort(records, selectedCategories, newType, sortField, sortDirection);
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === "asc";
    const newDirection = isAsc ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    applyFilterAndSort(records, selectedCategories, selectedType, field, newDirection);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Records
        </Typography>
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Filter by Category
          </Typography>
          {categories.map((category) => (
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
          ))}
          {categories.length === 0 && (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default TransactionList;
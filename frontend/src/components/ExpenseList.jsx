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
} from "@mui/material";

function ExpenseList({ token, refreshKey }) {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [expenseResponse, categoryResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8001/expense", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://127.0.0.1:8001/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setExpenses(expenseResponse.data);
        setCategories(categoryResponse.data);
        applyFilterAndSort(expenseResponse.data, selectedCategories, sortField, sortDirection);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, refreshKey]);

  const applyFilterAndSort = (data, selectedCats, field, direction) => {
    let filtered = data;
    if (selectedCats.length > 0) {
      filtered = data.filter((exp) => selectedCats.includes(exp.category));
    }
    const sorted = [...filtered].sort((a, b) => {
      const aValue = field === "amount" ? a.amount : a.date;
      const bValue = field === "amount" ? b.amount : b.date;
      return direction === "asc" ? (aValue < bValue ? -1 : 1) : (bValue < aValue ? -1 : 1);
    });
    setFilteredExpenses(sorted);
  };

  const handleCategoryChange = (category) => {
    const newSelected = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newSelected);
    applyFilterAndSort(expenses, newSelected, sortField, sortDirection);
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === "asc";
    const newDirection = isAsc ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    applyFilterAndSort(expenses, selectedCategories, field, newDirection);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Expenses
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
        {isLoading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!isLoading && filteredExpenses.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No expenses match the filter.
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
              {filteredExpenses.map((exp) => (
                <TableRow key={exp._id}>
                  <TableCell>{exp.amount} {exp.currency}</TableCell>
                  <TableCell>{exp.category}</TableCell>
                  <TableCell>{exp.date}</TableCell>
                  <TableCell>{exp.description || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default ExpenseList;
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
} from "@mui/material";

function ExpenseList({ token, refreshKey }) {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await axios.get("http://127.0.0.1:8001/expense", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load expenses.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpenses();
  }, [token, refreshKey]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Expenses
        </Typography>
        {isLoading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!isLoading && expenses.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No expenses yet.
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Amount</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((exp) => (
                <TableRow key={exp._id}>
                  <TableCell>{exp.amount} {exp.currency}</TableCell>
                  <TableCell>{exp.category}</TableCell>
                  <TableCell>{new Date(exp.date).toLocaleString()}</TableCell>
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
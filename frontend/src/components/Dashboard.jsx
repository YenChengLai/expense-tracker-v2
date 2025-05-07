import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Box,
  CircularProgress,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { Link } from "react-router-dom"; // Added for quick action links

function Dashboard({ token, refreshKey }) {
  const [stats, setStats] = useState({ total: 0, byCategory: {} });
  const [recentRecords, setRecentRecords] = useState([]); // Added for recent transactions
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await axios.get("http://127.0.0.1:8001/expense", {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 5 }, // Added limit for recent records
        });
        const records = response.data;
        const total = records.reduce((sum, rec) => sum + parseFloat(rec.amount), 0);
        const byCategory = records.reduce((acc, rec) => {
          const cat = rec.category;
          if (!acc[cat]) acc[cat] = { count: 0, total: 0 };
          acc[cat].count += 1;
          acc[cat].total += parseFloat(rec.amount);
          return acc;
        }, {});
        setStats({ total, byCategory });
        setRecentRecords(records.slice(0, 5)); // Store up to 5 recent records
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, [token, refreshKey]);

  const chartData = Object.entries(stats.byCategory).map(([category, data]) => ({
    id: category,
    value: data.total,
    label: category,
  }));

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Dashboard
        </Typography>
        {isLoading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!isLoading && (
          <Box>
            {/* Added quick action buttons */}
            <Box sx={{ mb: 4 }}>
              <Button
                variant="contained"
                component={Link}
                to="/add"
                sx={{ mr: 2 }}
              >
                Add Record
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/list"
              >
                View Records
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Total Records: ${stats.total.toFixed(2)}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Records by Category:
                </Typography>
                {Object.entries(stats.byCategory).length === 0 ? (
                  <Typography color="text.secondary">No records yet.</Typography>
                ) : (
                  Object.entries(stats.byCategory).map(([category, data]) => (
                    <Typography key={category} variant="body2">
                      {category}: {data.count} record(s), ${data.total.toFixed(2)}
                    </Typography>
                  ))
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {chartData.length > 0 && (
                  <PieChart
                    series={[{ data: chartData }]}
                    width={400}
                    height={200}
                    slotProps={{ legend: { hidden: chartData.length > 5 } }}
                  />
                )}
              </Grid>
            </Grid>
            {/* Added recent transactions table */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              {recentRecords.length === 0 ? (
                <Typography color="text.secondary">No recent transactions.</Typography>
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
                    {recentRecords.map((rec) => (
                      <TableRow key={rec.id}>
                        <TableCell>{rec.amount} {rec.currency}</TableCell>
                        <TableCell>{rec.category}</TableCell>
                        <TableCell>{rec.date}</TableCell>
                        <TableCell>{rec.description || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default Dashboard;
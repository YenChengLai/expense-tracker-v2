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
import { Link } from "react-router-dom";

function Dashboard({ token, refreshKey }) {
  const [stats, setStats] = useState({ total: 0, byCategory: {} });
  const [recentRecords, setRecentRecords] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await axios.get("http://127.0.0.1:8001/expense", {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 5 },
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
        setRecentRecords(records.slice(0, 5));
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
    <Box sx={{ p: 3, backgroundColor: "background.default", minHeight: "100vh" }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Dashboard
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {!isLoading && (
            <Box>
              <Grid container spacing={3}>
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
                      <Typography key={category} variant="body2" sx={{ mb: 1 }}>
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
                      sx={{ borderRadius: 16 }}
                    />
                  )}
                </Grid>
              </Grid>
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
    </Box>
  );
}

export default Dashboard;
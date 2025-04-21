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
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";

function Dashboard({ token, refreshKey }) {
  const [stats, setStats] = useState({ total: 0, byCategory: {} });
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
        const expenses = response.data;
        const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const byCategory = expenses.reduce((acc, exp) => {
          const cat = exp.category;
          if (!acc[cat]) acc[cat] = { count: 0, total: 0 };
          acc[cat].count += 1;
          acc[cat].total += parseFloat(exp.amount);
          return acc;
        }, {});
        setStats({ total, byCategory });
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpenses();
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
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Total Expenses: ${stats.total.toFixed(2)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Expenses by Category:
              </Typography>
              {Object.entries(stats.byCategory).length === 0 ? (
                <Typography color="text.secondary">No expenses yet.</Typography>
              ) : (
                Object.entries(stats.byCategory).map(([category, data]) => (
                  <Typography key={category} variant="body2">
                    {category}: {data.count} expense(s), ${data.total.toFixed(2)}
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
        )}
      </CardContent>
    </Card>
  );
}

export default Dashboard;
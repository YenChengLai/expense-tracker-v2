import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement
);

function Dashboard({ token, refreshKey }) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter states
  const [dateRange, setDateRange] = useState("last30days");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const expensesResponse = await axios.get(
          "http://127.0.0.1:8001/expense",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setExpenses(expensesResponse.data || []);

        const categoriesResponse = await axios.get(
          "http://127.0.0.1:8001/categories",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { show_universal: true },
          }
        );
        setCategories(categoriesResponse.data || []);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Failed to load dashboard data."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, refreshKey]);

  useEffect(() => {
    const filterExpenses = () => {
      let filtered = [...expenses];

      const now = new Date();
      let startDate;
      switch (dateRange) {
        case "last30days":
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case "thismonth":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "thisyear":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }
      filtered = filtered.filter(
        (expense) => new Date(expense.date) >= startDate
      );

      if (categoryFilter !== "all") {
        filtered = filtered.filter(
          (expense) => expense.category === categoryFilter
        );
      }

      setFilteredExpenses(filtered);
    };
    filterExpenses();
  }, [expenses, dateRange, categoryFilter]);

  const totalExpenses = filteredExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );
  const daysInRange =
    dateRange === "last30days"
      ? 30
      : dateRange === "thismonth"
      ? new Date().getDate()
      : dateRange === "thisyear"
      ? (new Date() - new Date(new Date().getFullYear(), 0, 1)) /
        (1000 * 60 * 60 * 24)
      : 365;
  const avgDailyExpense = totalExpenses / (daysInRange || 1);

  const categoryTotals = filteredExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});
  const highestCategory = Object.entries(categoryTotals).reduce(
    (max, [cat, total]) =>
      total > (max.total || 0) ? { category: cat, total } : max,
    {}
  );

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          "#4CAF50",
          "#FF9800",
          "#2196F3",
          "#F44336",
          "#AB47BC",
          "#26C6DA",
        ],
      },
    ],
  };

  const monthlyTotals = filteredExpenses.reduce((acc, exp) => {
    const date = new Date(exp.date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    acc[monthYear] = (acc[monthYear] || 0) + exp.amount;
    return acc;
  }, {});
  const lineData = {
    labels: Object.keys(monthlyTotals).sort(),
    datasets: [
      {
        label: "Monthly Expenses",
        data: Object.keys(monthlyTotals)
          .sort()
          .map((month) => monthlyTotals[month]),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        fill: true,
      },
    ],
  };

  const barData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: "Expenses by Category",
        data: Object.values(categoryTotals),
        backgroundColor: [
          "#4CAF50",
          "#FF9800",
          "#2196F3",
          "#F44336",
          "#AB47BC",
          "#26C6DA",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: (context) =>
            context.chart.canvas.parentNode.style.backgroundColor === "#121212"
              ? "#e0e0e0"
              : "#2d3748",
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: (context) =>
            context.chart.canvas.parentNode.style.backgroundColor === "#121212"
              ? "#d3d3d3"
              : "#4a5568",
        },
      },
      x: {
        ticks: {
          color: (context) =>
            context.chart.canvas.parentNode.style.backgroundColor === "#121212"
              ? "#d3d3d3"
              : "#4a5568",
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: (context) =>
            context.chart.canvas.parentNode.style.backgroundColor === "#121212"
              ? "#d3d3d3"
              : "#4a5568",
        },
      },
      x: {
        ticks: {
          color: (context) =>
            context.chart.canvas.parentNode.style.backgroundColor === "#121212"
              ? "#d3d3d3"
              : "#4a5568",
        },
      },
    },
  };

  const recentTransactions = filteredExpenses.slice(-5).reverse();

  // Dynamic chart height based on screen size
  const chartHeight = isXs ? "40vh" : isSm ? "50vh" : isMd ? "60vh" : "70vh";

  return (
    <Box
      sx={{
        p: isXs ? 2 : isSm ? 3 : 4,
        backgroundColor: "background.default",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {isLoading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Summary Cards */}
      <Grid
        container
        spacing={isXs ? 1 : isSm ? 2 : 3}
        sx={{ mb: isXs ? 2 : 4 }}
      >
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              width: "100%",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "medium", mb: 1, color: "text.primary" }}
              >
                Total Expenses
              </Typography>
              <Typography
                variant="h5"
                sx={{ color: "primary.main", fontWeight: "bold" }}
              >
                ${totalExpenses.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              width: "100%",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "medium", mb: 1, color: "text.primary" }}
              >
                Avg. Daily Expense
              </Typography>
              <Typography
                variant="h5"
                sx={{ color: "primary.main", fontWeight: "bold" }}
              >
                ${avgDailyExpense.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              width: "100%",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "medium", mb: 1, color: "text.primary" }}
              >
                Highest Category
              </Typography>
              <Typography
                variant="h5"
                sx={{ color: "primary.main", fontWeight: "bold" }}
              >
                {highestCategory.category || "N/A"} ($
                {highestCategory.total?.toFixed(2) || "0.00"})
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isXs ? "column" : "row",
          gap: isXs ? 2 : 3,
          mb: isXs ? 2 : 4,
          width: "100%",
        }}
      >
        <FormControl sx={{ minWidth: isXs ? "100%" : 200 }}>
          <InputLabel sx={{ color: "text.primary" }}>Date Range</InputLabel>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            label="Date Range"
            sx={{
              color: "text.primary",
              borderColor: "text.secondary",
              width: "100%",
            }}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="last30days">Last 30 Days</MenuItem>
            <MenuItem value="thismonth">This Month</MenuItem>
            <MenuItem value="thisyear">This Year</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: isXs ? "100%" : 200 }}>
          <InputLabel sx={{ color: "text.primary" }}>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Category"
            sx={{
              color: "text.primary",
              borderColor: "text.secondary",
              width: "100%",
            }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.name} value={cat.name}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Charts Section */}
      <Grid
        container
        spacing={isXs ? 1 : isSm ? 2 : 3}
        sx={{ mb: isXs ? 2 : 4 }}
      >
        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              width: "100%",
              height: chartHeight,
            }}
          >
            <CardContent
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "medium", mb: 2, color: "text.primary" }}
              >
                Expense Distribution
              </Typography>
              <Box sx={{ flexGrow: 1, width: "100%", height: "100%" }}>
                <Pie data={pieData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              width: "100%",
              height: chartHeight,
            }}
          >
            <CardContent
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "medium", mb: 2, color: "text.primary" }}
              >
                Expense Trends
              </Typography>
              <Box sx={{ flexGrow: 1, width: "100%", height: "100%" }}>
                <Line data={lineData} options={lineChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={isXs ? 1 : isSm ? 2 : 3}>
        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              width: "100%",
              height: chartHeight,
            }}
          >
            <CardContent
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "medium", mb: 2, color: "text.primary" }}
              >
                Category Breakdown
              </Typography>
              <Box sx={{ flexGrow: 1, width: "100%", height: "100%" }}>
                <Bar data={barData} options={barChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2, width: "100%" }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "medium", mb: 2, color: "text.primary" }}
              >
                Recent Transactions
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "text.primary" }}>Date</TableCell>
                    <TableCell sx={{ color: "text.primary" }}>
                      Category
                    </TableCell>
                    <TableCell sx={{ color: "text.primary" }}>Amount</TableCell>
                    <TableCell sx={{ color: "text.primary" }}>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTransactions.map((exp, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: "text.secondary" }}>
                        {new Date(exp.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>
                        {exp.category}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>
                        ${exp.amount.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>
                        {exp.notes || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;

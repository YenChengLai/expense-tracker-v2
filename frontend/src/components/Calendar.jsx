import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  CircularProgress,
  Alert,
  Tooltip,
  Chip,
  IconButton,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

function Calendar({ token }) {
  const [expenses, setExpenses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError("");
      try {
        const startDate = `${currentYear}-${(currentMonth + 1)
          .toString()
          .padStart(2, "0")}-01`;
        const endDate = `${currentYear}-${(currentMonth + 1)
          .toString()
          .padStart(2, "0")}-${new Date(
          currentYear,
          currentMonth + 1,
          0
        ).getDate()}`;

        const response = await axios.get("http://127.0.0.1:8001/expense", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            date_gte: startDate,
            date_lte: endDate,
          },
        });

        const data = response.data || [];
        const expenseMap = {};

        data.forEach((item) => {
          const day = new Date(item.date).getDate();
          if (!expenseMap[day]) {
            expenseMap[day] = [];
          }
          expenseMap[day].push(item);
        });

        setExpenses(expenseMap);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load expenses.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [token, currentMonth, currentYear]);

  const daysInMonth = () =>
    new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = () => new Date(currentYear, currentMonth, 1).getDay();

  const weeks = [];
  const days = [];
  const totalDays = daysInMonth();
  const firstDay = firstDayOfMonth();

  // Add empty cells for days before the 1st of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= totalDays; day++) {
    days.push(day);
  }

  // Split into weeks (rows of 7 days)
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Ensure the last week has 7 cells, filling with null if needed
  if (weeks[weeks.length - 1].length < 7) {
    const lastWeek = weeks[weeks.length - 1];
    while (lastWeek.length < 7) {
      lastWeek.push(null);
    }
  }

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (currentMonth === 0) {
      setCurrentYear((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (currentMonth === 11) {
      setCurrentYear((prev) => prev + 1);
    }
  };

  return (
    <Box
      sx={{ p: 3, backgroundColor: "background.default", minHeight: "100vh" }}
    >
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton onClick={handlePrevMonth} disabled={loading}>
              <ArrowBackIosIcon />
            </IconButton>
            <Typography variant="h5" sx={{ flexGrow: 1, textAlign: "center" }}>
              Calendar -{" "}
              {new Date(currentYear, currentMonth).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Typography>
            <IconButton onClick={handleNextMonth} disabled={loading}>
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <Table
              sx={{
                minWidth: 650,
                borderCollapse: "collapse",
                tableLayout: "fixed",
                width: "100%",
              }}
            >
              <TableHead>
                <TableRow>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <TableCell
                        key={day}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          textAlign: "center",
                          fontWeight: "bold",
                          backgroundColor: "background.paper",
                          width: "14.28%",
                        }}
                      >
                        {day}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {weeks.map((week, weekIndex) => (
                  <TableRow key={weekIndex}>
                    {week.map((day, dayIndex) => (
                      <TableCell
                        key={`${weekIndex}-${dayIndex}`}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          height: "100px",
                          verticalAlign: "top",
                          backgroundColor: day
                            ? "background.default"
                            : "background.paper",
                          p: 1,
                          width: "14.28%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {day && (
                          <>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold", mb: 1 }}
                            >
                              {day}
                            </Typography>
                            {expenses[day] &&
                              expenses[day].map((expense, index) => (
                                <Tooltip
                                  key={index}
                                  title={
                                    <Box>
                                      <Typography variant="body2">
                                        {expense.type}:{" "}
                                        {expense.amount.toFixed(2)} USD
                                      </Typography>
                                      <Typography variant="body2">
                                        Category: {expense.category}
                                      </Typography>
                                      <Typography variant="body2">
                                        Description:{" "}
                                        {expense.description || "N/A"}
                                      </Typography>
                                    </Box>
                                  }
                                >
                                  <Chip
                                    label={`${
                                      expense.type === "Expense" ? "-" : "+"
                                    }${expense.amount.toFixed(2)} (${
                                      expense.category
                                    })`}
                                    size="small"
                                    sx={{
                                      backgroundColor:
                                        expense.type === "Expense"
                                          ? "#ffe6e6"
                                          : "#e6ffe6",
                                      color:
                                        expense.type === "Expense"
                                          ? "red"
                                          : "green",
                                      mb: 0.5,
                                      display: "block",
                                      cursor: "pointer",
                                      width: "100%",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  />
                                </Tooltip>
                              ))}
                          </>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Calendar;

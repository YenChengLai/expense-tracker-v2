import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AdminApproval({ token }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://127.0.0.1:8002/pending-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load pending users.");
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, approve) => {
    setError("");
    setSuccess("");
    try {
      const response = await axios.post(
        "http://127.0.0.1:8002/approve-user",
        { userId, approve },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(response.data.message);
      fetchPendingUsers(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${approve ? "approve" : "reject"} user.`);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Approval
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : pendingUsers.length === 0 ? (
        <Typography>No pending registrations.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingUsers.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleApproval(user.userId, true)}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleApproval(user.userId, false)}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
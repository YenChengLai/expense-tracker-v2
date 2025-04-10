import { useState, useEffect } from "react";
import axios from "axios";

function ExpenseList({ token }) {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8001/expense", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(response.data);
        setError("");
      } catch (err) {
        setError("Failed to load expenses.");
      }
    };
    fetchExpenses();
  }, [token]);

  return (
    <div>
      <h2>Your Expenses</h2>
      {error && <p className="error">{error}</p>}
      {expenses.length === 0 ? (
        <p>No expenses yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp._id}>
                <td>{exp.amount} {exp.currency}</td>
                <td>{exp.category}</td>
                <td>{new Date(exp.date).toLocaleString()}</td>
                <td>{exp.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ExpenseList;
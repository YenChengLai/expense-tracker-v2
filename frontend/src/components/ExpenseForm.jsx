import { useState } from "react";
import axios from "axios";

function ExpenseForm({ token }) {
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: "",
    description: "",
    type: "expense",
    currency: "USD",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://127.0.0.1:8001/expense",
        { ...formData, date: new Date(formData.date).toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData({ amount: "", category: "", date: "", description: "", type: "expense", currency: "USD" });
      setError("");
    } catch (err) {
      setError("Failed to add expense.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Expense</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="number"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        placeholder="Amount"
        required
      />
      <input
        type="text"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        placeholder="Category"
        required
      />
      <input
        type="datetime-local"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
      />
      <input
        type="text"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Description"
      />
      <button type="submit">Add Expense</button>
    </form>
  );
}

export default ExpenseForm;
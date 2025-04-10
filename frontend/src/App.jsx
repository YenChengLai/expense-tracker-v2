import { useState } from "react";
import LoginForm from "./components/LoginForm";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  return (
    <div className="container">
      {!token ? (
        <LoginForm setToken={setToken} />
      ) : (
        <>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              setToken("");
            }}
          >
            Logout
          </button>
          <ExpenseForm token={token} />
          <ExpenseList token={token} />
        </>
      )}
    </div>
  );
}

export default App;
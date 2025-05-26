# expense-tracker-v2

2nd version of the previous expense tracker. For previous version, please check: <https://github.com/YenChengLai/expense-tracker>

A personal/family expense tracker built with FastAPI, React, and MongoDB.

## Features

*   **User Authentication:** Secure login and registration (via `auth-service`).
*   **Expense Tracking:** Create, view, and manage personal or family expenses (via `expense-service`).
*   **Detailed Expense Information:** Record amount, category, date, and description for each expense.
*   **User-Specific Data:** Users can only view and manage their own expenses.
*   **API-Based Backend:** FastAPI backend providing clear and testable endpoints.
*   **Reactive Frontend:** User-friendly interface built with React for a smooth experience.

## Technologies Used

**Backend:**
*   **Programming Language:** Python 3.12+
*   **Framework:** FastAPI
*   **Database:** MongoDB
*   **Testing:** Pytest

**Frontend:**
*   **Framework:** React 19
*   **Build Tool:** Vite
*   **UI Library:** Material-UI (MUI)
*   **HTTP Client:** Axios
*   **Date Handling:** Luxon (with MUI date pickers)
*   **Package Manager:** npm

**General:**
*   **Version Control:** Git

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Git:** For cloning the repository. (Installation: [https://git-scm.com/book/en/v2/Getting-Started-Installing-Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git))
*   **Python 3.12+:** For the backend services. (Installation: [https://www.python.org/downloads/](https://www.python.org/downloads/))
*   **Node.js 20+:** For the frontend development. (Installation: [https://nodejs.org/](https://nodejs.org/))
*   **MongoDB:** As the database for the application. (Installation: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community))
    *   Ensure your MongoDB server is running.

## Getting Started / Installation

Follow these steps to get the project up and running on your local machine.

**1. Clone the Repository**

```bash
git clone <your-repository-url> # Replace <your-repository-url> with the actual URL
cd expense-tracker-v2
```

**2. Backend Setup**

   a. **Navigate to the backend directory:**
      ```bash
      cd backend
      ```

   b. **Create and activate a Python virtual environment:**
      ```bash
      python3 -m venv venv
      source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
      ```

   c. **Install Python dependencies:**
      ```bash
      pip install -r requirements.txt
      ```

   d. **Set up MongoDB:**
      *   Ensure your MongoDB instance is running.
      *   The backend services connect to `mongodb://localhost:27017`.
      *   For initial testing, you can add a test user to the `expense_tracker` database. Open `mongosh`:
         ```mongo
         use expense_tracker
         db.user.insertOne({
           "email": "test@example.com",
           "hashedPassword": "$2b$12$gMLXIaKlt2EzJfLnDDY6au4ttQ8nsRTzAd0qFKQ.G908neRVQns7y" // Default password: "123456"
         });
         ```
         You can generate other passwords using `python3 generate_hash.py <password>` from the `backend` directory.


   e. **Run the backend services:**
      The backend consists of an authentication service and an expense service.
      ```bash
      make start
      ```
      This command will start:
      *   Auth Service: `http://localhost:8002`
      *   Expense Service: `http://localhost:8001`

**3. Frontend Setup**

   a. **Navigate to the frontend directory (from the project root):**
      ```bash
      cd ../frontend  # If you are in the backend directory
      # OR
      # cd frontend  # If you are in the project root
      ```

   b. **Install Node.js dependencies:**
      ```bash
      npm install
      ```

   c. **Run the frontend development server:**
      ```bash
      npm run dev
      ```
      The frontend will be available at `http://localhost:5173`.

**4. Accessing the Application**

*   Open your browser and go to `http://localhost:5173`.
*   Log in with the test credentials (e.g., `test@example.com` / `123456`) or any other user you've added to the database.

## Running Tests

**Backend Tests**

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Ensure your virtual environment is activated:**
    ```bash
    source venv/bin/activate # On Windows, use `venv\Scripts\activate`
    ```
3.  **Run tests for the auth-service:**
    ```bash
    pytest auth-service/test/
    ```
4.  **Run tests for the expense-service:**
    ```bash
    pytest expense-service/test/
    ```
    *Note: Ensure MongoDB is running for these tests, as they might interact with the database.*

**Frontend Linting**

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Run the linter (ESLint):**
    ```bash
    npm run lint
    ```
    This will check the frontend code for style and potential errors.

## Project Structure

- `backend/`: FastAPI backend
- `frontend/`: React frontend
- `docs/`: Documentation (requirements, etc.)

```plaintext
/expense-tracker
├── .vscode
|   └── settings.json
├── backend
|   ├── auth-service
|   |   ├── app
|   |   |   ├── __init__.py
|   |   |   ├── auth.py
|   |   |   ├── db.py
|   |   |   ├── main.py
|   |   |   └── models.py
│   |   ├── test
|   |   |   └── test_auth_main.py
|   |   ├── README.md
|   |   └── pytest.ini
|   ├── expense-service
│   |   ├── app
|   |   |   ├── __init__.py
|   |   |   ├── auth.py
|   |   |   ├── db.py
|   |   |   ├── main.py
|   |   |   └── models.py
│   |   ├── test
|   |   |   └── test_main.py
|   |   └── README.md
|   ├── .python-version
|   ├── generate_hash.py
|   ├── makefile
|   ├── requirements.txt
|   └── ruff.toml
├── docs
|   ├── architecture.md
|   ├── mongondb_setup_summary.md
|   ├── README.md
|   └── requirements.md
├── frontend
|   ├── public
|   |   ├── favicon.png
|   |   └── vite.svg
|   ├── src
|   |   ├── components
|   |   |   ├── AdminApproval.jsx
|   |   |   ├── Calendar.jsx
|   |   |   ├── Dashboard.jsx
|   |   |   ├── Expenses.jsx
|   |   |   ├── ForgotPassword.jsx
|   |   |   ├── Login.jsx
|   |   |   ├── Settings.jsx
|   |   |   ├── Sidebar.jsx
|   |   |   └── Signup.jsx
|   |   ├── App.jsx
|   |   ├── main.jsx
|   |   └── theme.js
|   ├── README.md
|   ├── eslint.config.js
|   ├── index.html
|   ├── package.json
|   ├── package-lock.json
|   ├── tsconfig.app.json
|   ├── tsconfig.json
|   ├── tsconfig.node.json
|   ├── vite.config.ts
|   └── requirements.md
├── .gitignore
└── README.md
```

## Contributing

Contributions are welcome! If you'd like to improve the Expense Tracker App, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b fix/your-bug-fix-name
    ```
3.  **Make your changes.**
4.  **Ensure your code lints and tests pass:**
    *   For backend changes, run `pytest` as described in the "Running Tests" section.
    *   For frontend changes, run `npm run lint`.
5.  **Commit your changes** with a clear and descriptive commit message.
6.  **Push your branch** to your forked repository.
7.  **Create a Pull Request** to the main repository's `main` branch (or the relevant development branch).

Please provide a clear description of your changes in the Pull Request.

## License

This project does not currently have a license. Consider adding one, such as the MIT License, to define how others can use and contribute to your work.

You can create a `LICENSE` file in the root of your project and add the text of your chosen license (e.g., from [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT)).

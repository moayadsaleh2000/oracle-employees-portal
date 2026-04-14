import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import alasql from "alasql";
import Employees from "./pages/Employees";
import Login from "./pages/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    alasql("CREATE TABLE IF NOT EXISTS auth (id INT, status STRING)");
    alasql(
      "CREATE TABLE IF NOT EXISTS employees (DisplayName STRING, EmailAddress STRING, EmployeeNumber STRING)",
    );

    const checkAuth = () => {
      try {
        const res = alasql("SELECT * FROM auth WHERE id = 1");
        if (res.length > 0 && res[0].status === "logged_in") {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (e) {
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        جاري تشغيل نظام NovaTech...
      </div>
    );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !isLoggedIn ? (
              <Login setAuth={setIsLoggedIn} />
            ) : (
              <Navigate to="/employees" />
            )
          }
        />
        <Route
          path="/employees"
          element={isLoggedIn ? <Employees /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

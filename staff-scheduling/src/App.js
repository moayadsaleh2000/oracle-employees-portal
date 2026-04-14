import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Employees from "./pages/Employees";
import Login from "./pages/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("nova_token");

      if (token) {
        setIsLoggedIn(true);
      } else {
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
          element={
            isLoggedIn ? (
              <Employees setAuth={setIsLoggedIn} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

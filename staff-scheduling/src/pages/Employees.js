import React, { useState, useEffect, useCallback } from "react";
import "./Employees.css";

export default function Employees({ setAuth }) {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const limit = 5;

  const loadData = useCallback(async (currentSearch, currentOffset) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("nova_token");

      const url = `http://localhost:5000/employees?offset=${currentOffset}&limit=${limit}&q=${encodeURIComponent(currentSearch)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();
      setEmployees(data.items || []);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("خطأ في التحميل:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(searchTerm, offset);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, offset, loadData]);

  const handleLogout = async () => {
    const token = localStorage.getItem("nova_token");

    try {
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        headers: { Authorization: token },
      });
    } catch (e) {
      console.log("فشل مسح التوكن من السيرفر، سيتم الحذف محلياً فقط");
    }
    localStorage.removeItem("nova_token");
    if (setAuth) setAuth(false);
  };

  return (
    <div className="employees-app-container">
      <header className="main-nav">
        <div className="nav-content">
          <h1>
            NovaTech <span>ERP</span>
          </h1>
          <button onClick={handleLogout} className="logout-btn">
            تسجيل الخروج
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="table-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="ابحث عن موظف (اسم أو رقم وظيفي)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setOffset(0);
              }}
              className="search-bar-large"
            />
            {loading && <div className="spinner-inline"></div>}
          </div>
        </div>

        <div className="table-section shadow">
          <table className="styled-table">
            <thead>
              <tr>
                <th>الموظف</th>
                <th>المعرف</th>
                <th>البريد الإلكتروني</th>
                <th>القسم</th>
                <th>المسمى الوظيفي</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0
                ? employees.map((emp) => (
                    <tr
                      key={emp.PersonNumber}
                      onClick={() => setSelectedEmployee(emp)}
                      className="clickable-row"
                    >
                      <td>
                        <strong>{emp.DisplayName}</strong>
                      </td>
                      <td>
                        <span className="badge-id">#{emp.PersonNumber}</span>
                      </td>
                      <td>{emp.WorkEmail || "---"}</td>
                      <td>{emp.DepartmentName || "عام"}</td>
                      <td>
                        <span className="job-tag">
                          {emp.JobTitle || "موظف"}
                        </span>
                      </td>
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td colSpan="5" className="no-data">
                        لا توجد نتائج
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>

        <footer className="pagination-footer">
          <button
            className="pagi-btn"
            disabled={offset === 0 || loading}
            onClick={() => setOffset(offset - limit)}
          >
            السابق
          </button>
          <span className="page-indicator">
            الصفحة {Math.floor(offset / limit) + 1}
          </span>
          <button
            className="pagi-btn"
            disabled={!hasMore || loading}
            onClick={() => setOffset(offset + limit)}
          >
            التالي
          </button>
        </footer>
      </main>
      {selectedEmployee && (
        <div
          className="profile-overlay"
          onClick={() => setSelectedEmployee(null)}
        >
          <div className="profile-card" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedEmployee.DisplayName}</h2>
            <p>{selectedEmployee.JobTitle}</p>
            <button onClick={() => setSelectedEmployee(null)}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}

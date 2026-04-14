import React, { useState, useEffect, useCallback } from "react";
import alasql from "alasql";
import "./Employees.css";

export default function Employees() {
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
      const url = `http://localhost:5000/employees?offset=${currentOffset}&limit=${limit}&q=${encodeURIComponent(currentSearch)}`;
      const response = await fetch(url);
      const data = await response.json();
      setEmployees(data.items || []);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Load Error:", error);
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

  const handleLogout = () => {
    alasql("DELETE FROM auth");
    window.location.href = "/";
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
                <th>الموقع</th>
                <th>تاريخ التعيين</th>
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
                      <td className="emp-name-cell">
                        <strong>{emp.DisplayName}</strong>
                      </td>
                      <td>
                        <span className="badge-id">#{emp.PersonNumber}</span>
                      </td>
                      <td>{emp.WorkEmail || "---"}</td>
                      <td>{emp.DepartmentName || "عام"}</td>
                      <td>{emp.LocationCode || "---"}</td>
                      <td>
                        {emp.CreationDate
                          ? new Date(emp.CreationDate).toLocaleDateString()
                          : "---"}
                      </td>
                      <td>
                        <span className="job-tag">
                          {emp.JobTitle || "موظف"}
                        </span>
                      </td>
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td colSpan="7" className="no-data">
                        لم يتم العثور على نتائج
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
            <div className="profile-header">
              <div className="avatar">
                {selectedEmployee.DisplayName.charAt(0)}
              </div>
              <h2>{selectedEmployee.DisplayName}</h2>
              <p className="main-job-title">{selectedEmployee.JobTitle}</p>
            </div>

            <div className="profile-info-grid">
              <div className="info-box">
                <label>الرقم الوظيفي</label>
                <p>{selectedEmployee.PersonNumber}</p>
              </div>
              <div className="info-box">
                <label>القسم</label>
                <p>{selectedEmployee.DepartmentName || "غير محدد"}</p>
              </div>
              <div className="info-box">
                <label>نوع الموظف</label>
                <p>{selectedEmployee.WorkerType || "موظف رسمي"}</p>
              </div>
              <div className="info-box">
                <label>الحالة</label>
                <p>{selectedEmployee.AssignmentStatusType || "Active (نشط)"}</p>
              </div>
              <div className="info-box">
                <label>الوحدة التنظيمية</label>
                <p>{selectedEmployee.BusinessUnitName || "NovaTech Main"}</p>
              </div>
              <div className="info-box">
                <label>آخر تحديث</label>
                <p>
                  {selectedEmployee.LastUpdateDate
                    ? new Date(
                        selectedEmployee.LastUpdateDate,
                      ).toLocaleDateString()
                    : "---"}
                </p>
              </div>
            </div>

            <div className="profile-footer">
              <button
                className="action-btn-print"
                onClick={() => window.print()}
              >
                طباعة
              </button>
              <button
                className="close-btn-secondary"
                onClick={() => setSelectedEmployee(null)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

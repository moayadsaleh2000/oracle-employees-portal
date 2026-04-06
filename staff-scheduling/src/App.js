import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [employees, setEmployees] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const limit = 5;

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const url = `${process.env.REACT_APP_API_URL}/employees?offset=${offset}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setEmployees(data.items || []);
      setHasMore(data.hasMore);
    } catch (fetchError) {
      console.error("خطأ في الاتصال بالسيرفر:", fetchError);
      setError("حدث خطأ أثناء تحميل البيانات. حاول مرة أخرى.");
      setEmployees([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [offset]);

  return (
    <div className="container">
      <h1>بوابة موظفي أوراكل</h1>

      <div className="status-bar">
        {loading ? (
          <span className="status-message loading">جارٍ التحميل...</span>
        ) : error ? (
          <span className="status-message error">{error}</span>
        ) : (
          <span className="status-message">
            عرض {employees.length} من سجلات الموظفين
          </span>
        )}
      </div>

      <div className="table-wrapper">
        <table className="employee-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الرقم الوظيفي</th>
              <th>الإيميل</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.PersonNumber}>
                <td>{emp.DisplayName}</td>
                <td>{emp.PersonNumber}</td>
                <td>{emp.WorkEmail || "لا يوجد"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && employees.length === 0 && !error && (
        <p className="empty-state">لا توجد نتائج للعرض حالياً.</p>
      )}

      <div className="pagination">
        <button
          onClick={() => setOffset(offset - limit)}
          disabled={offset === 0 || loading}
        >
          السابق
        </button>
        <span className="page-info">صفحة {Math.floor(offset / limit) + 1}</span>
        <button
          onClick={() => setOffset(offset + limit)}
          disabled={!hasMore || loading}
        >
          التالي
        </button>
      </div>
    </div>
  );
}

export default App;

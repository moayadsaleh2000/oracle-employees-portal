import React, { useEffect, useState } from "react";

function App() {
  const [employees, setEmployees] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 5;

  const loadData = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/employees?offset=${offset}`;
      const response = await fetch(url);
      const data = await response.json();

      setEmployees(data.items || []);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("خطأ في الاتصال بالسيرفر:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [offset]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>بوابة موظفي أوراكل</h1>

      <table border="1" width="100%" style={{ borderCollapse: "collapse" }}>
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

      <div>
        <button
          onClick={() => setOffset(offset - limit)}
          disabled={offset === 0}
        >
          السابق
        </button>
        <button
          onClick={() => setOffset(offset + limit)}
          disabled={!hasMore}
          style={{ marginLeft: "10px" }}
        >
          التالي
        </button>
      </div>
    </div>
  );
}

export default App;

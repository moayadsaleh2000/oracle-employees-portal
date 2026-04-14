import "./Login.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import alasql from "alasql";
import Swal from "sweetalert2";

function Login({ setAuth }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.showLoading();

    const endpoint = isRegister ? "register" : "login";

    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        if (isRegister) {
          Swal.fire({
            icon: "success",
            title: "تم التسجيل بنجاح!",
            text: "سجل دخولك الآن",
          });
          setIsRegister(false);
        } else {
          alasql("DELETE FROM auth");
          alasql("INSERT INTO auth VALUES (1, 'logged_in')");
          setAuth(true);
          navigate("/employees");
        }
      } else {
        Swal.fire({ icon: "error", title: "خطأ", text: data.error });
      }
    } catch (error) {
      Swal.fire({
        icon: "warning",
        title: "خطأ اتصال",
        text: "تأكد من تشغيل الباك إند",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isRegister ? "إنشاء حساب" : "تسجيل الدخول"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">
            {isRegister ? "سجل الآن" : "دخول"}
          </button>
        </form>
        <div className="toggle-container">
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "لديك حساب؟ سجل دخول" : "حساب جديد؟ أنشئ حساباً"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;

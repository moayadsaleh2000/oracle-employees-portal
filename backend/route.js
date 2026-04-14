const express = require("express");
const { getEmployees } = require("./service");
const db = require("./db");

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.get(sql, [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: "خطأ في السيرفر" });
    if (row) {
      res.json({ success: true, user: { id: row.id, username: row.username } });
    } else {
      res.status(401).json({ success: false, error: "بيانات غير صحيحة" });
    }
  });
});

router.post("/register", (req, res) => {
  const { username, password } = req.body;

  const checkSql = "SELECT * FROM users WHERE username = ?";
  db.get(checkSql, [username], (err, row) => {
    if (row) {
      return res
        .status(400)
        .json({ success: false, error: "اسم المستخدم موجود مسبقاً" });
    }

    const insertSql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.run(insertSql, [username, password], function (err) {
      if (err)
        return res
          .status(500)
          .json({ success: false, error: "خطأ أثناء التسجيل" });
      res.json({ success: true, message: "تم إنشاء الحساب بنجاح" });
    });
  });
});

router.get("/employees", async (req, res) => {
  const offset = parseInt(req.query.offset, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 5;
  const searchQuery = req.query.q || "";
  try {
    const data = await getEmployees(offset, limit, searchQuery);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "فشل الاتصال بنظام أوراكل" });
  }
});

module.exports = router;

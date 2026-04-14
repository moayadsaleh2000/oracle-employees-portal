const express = require("express");
const crypto = require("crypto");
const { getEmployees } = require("./service");
const db = require("./db");

const router = express.Router();

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token)
    return res.status(401).json({ success: false, error: "يجب تسجيل الدخول" });

  db.get("SELECT * FROM users WHERE token = ?", [token], (err, row) => {
    if (err || !row)
      return res.status(401).json({ success: false, error: "جلسة منتهية" });
    req.user = row;
    next();
  });
};

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, user) => {
      if (user) {
        const token = crypto.randomBytes(32).toString("hex");
        db.run(
          "UPDATE users SET token = ? WHERE id = ?",
          [token, user.id],
          () => {
            res.json({
              success: true,
              token: token,
              user: { username: user.username },
            });
          },
        );
      } else {
        res.status(401).json({ success: false, error: "بيانات خاطئة" });
      }
    },
  );
});

router.post("/logout", authMiddleware, (req, res) => {
  db.run("UPDATE users SET token = NULL WHERE id = ?", [req.user.id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, message: "تم مسح التوكن من السيرفر" });
  });
});

router.get("/employees", authMiddleware, async (req, res) => {
  try {
    const data = await getEmployees(
      req.query.offset,
      req.query.limit,
      req.query.q,
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: "خطأ في أوراكل" });
  }
});

module.exports = router;

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "novatech.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("خطأ في الاتصال بقاعدة البيانات:", err.message);
  } else {
    console.log("تم الاتصال بـ SQLite بنجاح.");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      token TEXT
    )
  `,
    (err) => {
      if (err) {
        console.error("خطأ في إنشاء جدول users:", err.message);
      } else {
        db.run("ALTER TABLE users ADD COLUMN token TEXT", (err) => {});
      }
    },
  );

  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) return;

    if (row && row.count === 0) {
      const defaultUser = "admin";
      const defaultPass = "1234";
      const stmt = db.prepare(
        "INSERT INTO users (username, password) VALUES (?, ?)",
      );
      stmt.run(defaultUser, defaultPass);
      stmt.finalize();
      console.log("تم إنشاء مستخدم admin الافتراضي.");
    }
  });
});

module.exports = db;

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
  db.run(
    `
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `,
    (err) => {
      if (err) console.error("خطأ في إنشاء جدول config:", err.message);
    },
  );

  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `,
    (err) => {
      if (err) console.error("خطأ في إنشاء جدول users:", err.message);
    },
  );

  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) {
      console.error("خطأ أثناء فحص جدول المستخدمين:", err.message);
      return;
    }

    if (row && row.count === 0) {
      const defaultUser = "admin";
      const defaultPass = "1234";

      const stmt = db.prepare(
        "INSERT INTO users (username, password) VALUES (?, ?)",
      );
      stmt.run(defaultUser, defaultPass, (err) => {
        if (err) console.error("خطأ في إنشاء مستخدم admin:", err.message);
        else console.log("تم إنشاء مستخدم admin الافتراضي.");
      });
      stmt.finalize();
    }
  });
});

module.exports = db;

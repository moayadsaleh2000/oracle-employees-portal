const express = require("express");
const { getEmployees } = require("./service");

const router = express.Router();

router.get("/employees", async (req, res) => {
  const offset = parseInt(req.query.offset, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 5;

  try {
    const data = await getEmployees(offset, limit);
    res.json(data);
  } catch (error) {
    console.error("Oracle Error:", error.response?.data || error.message);
    res.status(error.response?.status || error.status || 500).json({
      error: "Failed to connect to Oracle system",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;

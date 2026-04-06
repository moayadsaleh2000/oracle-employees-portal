const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const employeeRoutes = require("./route");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(employeeRoutes);

app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});

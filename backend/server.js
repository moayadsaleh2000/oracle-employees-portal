const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let currentToken = "";

const fetchNewToken = async () => {
  try {
    console.log("جاري طلب توكن جديد من المزود...");
    const response = await axios.get(
      `${process.env.TOKEN_URL}?t=${Date.now()}`,
    );

    if (response.data && response.data.token) {
      currentToken = response.data.token.trim();
      console.log(" تم تحديث التوكن بنجاح.");
      return currentToken;
    }
    throw new Error("لم يتم العثور على التوكن في استجابة المزود");
  } catch (error) {
    console.error("فشل في جلب التوكن:", error.message);
    return null;
  }
};

app.get("/employees", async (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 5;
  const cleanBaseUrl = process.env.BASE_URL.replace(/\/$/, "");

  const callOracle = async (token) => {
    return axios.get(`${cleanBaseUrl}/hcmRestApi/resources/11.13.18.05/emps`, {
      params: { limit, offset },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "REST-Framework-Version": "4",
        Accept: "application/json",
      },
      timeout: 10000,
    });
  };

  try {
    if (!currentToken) {
      const token = await fetchNewToken();
      if (!token)
        return res.status(500).json({ error: "تعذر الحصول على توكن" });
    }

    try {
      const response = await callOracle(currentToken);
      return res.json({
        items: response.data.items || [],
        hasMore: response.data.hasMore,
      });
    } catch (oracleError) {
      if (oracleError.response && oracleError.response.status === 401) {
        console.warn(" التوكن مرفوض (401)، محاولة التجديد...");
        const newToken = await fetchNewToken();
        if (newToken) {
          const retryResponse = await callOracle(newToken);
          return res.json({
            items: retryResponse.data.items || [],
            hasMore: retryResponse.data.hasMore,
          });
        }
      }
      throw oracleError;
    }
  } catch (error) {
    console.error(" Oracle Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "فشل الاتصال بنظام أوراكل",
      details: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`السيرفر يعمل على: http://localhost:${PORT}`);
});

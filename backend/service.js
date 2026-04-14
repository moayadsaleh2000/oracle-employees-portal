const axios = require("axios");
const db = require("./db");

const getStoredToken = () => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT value FROM config WHERE key = 'oracle_token'",
      (err, row) => {
        if (err) reject(err);
        resolve(row ? row.value : null);
      },
    );
  });
};

const saveToken = (token) => {
  db.run(
    "INSERT OR REPLACE INTO config (key, value) VALUES ('oracle_token', ?)",
    [token],
  );
};

const fetchNewToken = async () => {
  try {
    const response = await axios.get(
      `${process.env.TOKEN_URL}?t=${Date.now()}`,
    );
    if (response.data && response.data.token) {
      const token = response.data.token.trim();
      saveToken(token);
      return token;
    }
    throw new Error("Token not found from Oracle");
  } catch (error) {
    console.error("Oracle Token fetch error:", error.message);
    return null;
  }
};

const callOracle = async (token, offset, limit, searchQuery = "") => {
  const cleanBaseUrl = process.env.BASE_URL.replace(/\/$/, "");

  const params = {
    limit,
    offset,
    totalResults: false,
  };

  if (searchQuery && searchQuery.trim() !== "") {
    params.q = isNaN(searchQuery)
      ? `DisplayName LIKE '%${searchQuery}%'`
      : `PersonNumber='${searchQuery}'`;
  }

  try {
    return await axios.get(
      `${cleanBaseUrl}/hcmRestApi/resources/11.13.18.05/emps`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "REST-Framework-Version": "4",
          Accept: "application/json",
        },
        timeout: 20000,
      },
    );
  } catch (error) {
    console.error("!!! Oracle Error Detail:", error.response?.data);
    throw error;
  }
};

const getEmployees = async (offset = 0, limit = 5, searchQuery = "") => {
  let token = await getStoredToken();
  if (!token) {
    token = await fetchNewToken();
  }

  try {
    const response = await callOracle(token, offset, limit, searchQuery);

    return {
      success: true,
      items: response.data.items || [],
      hasMore: response.data.hasMore,
    };
  } catch (error) {
    if (error.response?.status === 401) {
      const newToken = await fetchNewToken();
      if (newToken) {
        const retry = await callOracle(newToken, offset, limit, searchQuery);
        return {
          success: true,
          items: retry.data.items || [],
          hasMore: retry.data.hasMore,
        };
      }
    }

    return {
      success: false,
      error: "فشل في جلب البيانات من نظام أوراكل، تأكد من الإعدادات.",
    };
  }
};

module.exports = { getEmployees, fetchNewToken };

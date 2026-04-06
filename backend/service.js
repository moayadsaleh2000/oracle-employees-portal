const axios = require("axios");

let currentToken = "";

const fetchNewToken = async () => {
  try {
    console.log("Requesting new token from provider...");
    const response = await axios.get(`${process.env.TOKEN_URL}?t=${Date.now()}`);

    if (response.data && response.data.token) {
      currentToken = response.data.token.trim();
      console.log("Token updated successfully.");
      return currentToken;
    }

    throw new Error("Token was not found in provider response");
  } catch (error) {
    console.error("Failed to fetch token:", error.message);
    return null;
  }
};

const callOracle = async (token, offset, limit) => {
  const cleanBaseUrl = process.env.BASE_URL.replace(/\/$/, "");
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

const getEmployees = async (offset = 0, limit = 5) => {
  if (!currentToken) {
    const token = await fetchNewToken();
    if (!token) {
      const error = new Error("Unable to obtain token");
      error.status = 500;
      throw error;
    }
  }

  try {
    const response = await callOracle(currentToken, offset, limit);
    return {
      items: response.data.items || [],
      hasMore: response.data.hasMore,
    };
  } catch (oracleError) {
    if (oracleError.response && oracleError.response.status === 401) {
      console.warn("Token rejected (401), retrying with a new token...");
      const newToken = await fetchNewToken();
      if (newToken) {
        const retryResponse = await callOracle(newToken, offset, limit);
        return {
          items: retryResponse.data.items || [],
          hasMore: retryResponse.data.hasMore,
        };
      }
    }
    throw oracleError;
  }
};

module.exports = {
  fetchNewToken,
  callOracle,
  getEmployees,
};

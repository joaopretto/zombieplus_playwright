require('dotenv').config();

const { request } = require("@playwright/test");

async function getAuthToken() {
  const apiContext = await request.newContext({
    baseURL: process.env.BASE_API,
  });

  const loginResponse = await apiContext.post("/sessions", {
    data: {
      email: "admin@zombieplus.com",
      password: "pwd123",
    },
  });

  if (!loginResponse.ok()) {
    throw new Error(
      `Login falhou: ${loginResponse.status()} ${loginResponse.statusText()}`
    );
  }

  const body = await loginResponse.json();
  return body.token;
}

async function getAuthenticatedContext() {
  const token = await getAuthToken();

  const jsonContext = await request.newContext({
    baseURL: process.env.BASE_API,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const formDataContext = await request.newContext({
      baseURL: process.env.BASE_API,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

  return { jsonContext, formDataContext};
}

module.exports = { getAuthenticatedContext };

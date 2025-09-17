const { request } = require("@playwright/test");

async function getAuthenticatedContext() {
  const apiContext = await request.newContext({
    baseURL: "http://localhost:3333",
  });

  const loginResponse = await apiContext.post("/sessions", {
    data: {
      email: "admin@zombieplus.com", 
      password: "pwd123",  
    },
  });

  if (!loginResponse.ok()) {
    throw new Error(`Login falhou: ${loginResponse.status()} ${loginResponse.statusText()}`);
  }

  const body = await loginResponse.json();
  const token = body.token; 

  const authContext = await request.newContext({
    baseURL: "http://localhost:3333",
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return authContext;
}

module.exports = { getAuthenticatedContext };

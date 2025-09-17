const { test, expect } = require("../support");
const { getAuthenticatedContext } = require("../helper/auth");

test("Deve cadastrar um lead na fila de espera", async ({ page }) => {
  const api = await getAuthenticatedContext();

  const response = await api.get("/leads", {
    params: {
      email: "joao@playwright.com",
    },
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();

  if (body.total > 0) {
    const id = body.data[0].id;
    const deleteLead = await api.delete(`/leads/${id}`);
    expect(deleteLead.ok()).toBeTruthy;
  }

  await page.landing.visit();
  await page.landing.openLeadModal();
  await page.landing.submitLeadForm("Joao Pretto", "joao@playwright.com");

  const message =
    "Agradecemos por compartilhar seus dados conosco. Em breve, nossa equipe entrará em contato!";
  await page.toast.haveText(message);
});

test("Não deve cadastrar um lead na fila de espera", async ({ page }) => {
  await page.landing.visit();
  await page.landing.openLeadModal();
  await page.landing.submitLeadForm("LeadCadastrada", "leadCadastrada@playwright.com");

  const message =
    "O endereço de e-mail fornecido já está registrado em nossa fila de espera.";
  await page.toast.haveText(message);
});

test("Não deve cadastrar com email invalído", async ({ page }) => {
  await page.landing.visit();
  await page.landing.openLeadModal();
  await page.landing.submitLeadForm("Joao Pretto", "joao.playwright.com");
  await page.landing.alertHaveText("Email incorreto");
});

test("Não deve cadastrar sem nome preenchido", async ({ page }) => {
  await page.landing.visit();
  await page.landing.openLeadModal();
  await page.landing.submitLeadForm("", "joao@playwright.com");
  await page.landing.alertHaveText("Campo obrigatório");
});

test("Não deve cadastrar sem email preenchido", async ({ page }) => {
  await page.landing.visit();
  await page.landing.openLeadModal();
  await page.landing.submitLeadForm("Joao Pretto", "");
  await page.landing.alertHaveText("Campo obrigatório");
});

test("Não deve cadastrar com nenhum campo preenchido", async ({ page }) => {
  await page.landing.visit();
  await page.landing.openLeadModal();
  await page.landing.submitLeadForm("", "");
  await page.landing.alertHaveText(["Campo obrigatório", "Campo obrigatório"]);
});

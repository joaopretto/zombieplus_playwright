const { test, expect } = require("../support");
const { getAuthenticatedContext } = require("../helper/auth");

test("Deve cadastrar um lead na fila de espera", async ({ page }) => {
  const { jsonContext } = await getAuthenticatedContext();

  const response = await jsonContext.get("/leads", {
    params: {
      email: "joao@playwright.com",
    },
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();

  if (body.total > 0) {
    const id = body.data[0].id;
    const deleteLead = await jsonContext.delete(`/leads/${id}`);
    expect(deleteLead.ok()).toBeTruthy;
  }

  await page.leads.visit();
  await page.leads.openLeadModal();
  await page.leads.submitLeadForm("Joao Pretto", "joao@playwright.com");

  const message =
    "Agradecemos por compartilhar seus dados conosco. Em breve, nossa equipe entrará em contato.";
  await page.popup.haveText(message);
});

test("Não deve cadastrar um lead na fila de espera", async ({ page }) => {
  await page.leads.visit();
  await page.leads.openLeadModal();
  await page.leads.submitLeadForm("LeadCadastrada", "leadCadastrada@playwright.com");

  const message =
    "Verificamos que o endereço de e-mail fornecido já consta em nossa lista de espera. Isso significa que você está um passo mais perto de aproveitar nossos serviços.";
  await page.popup.haveText(message);
});

test("Não deve cadastrar com email invalído", async ({ page }) => {
  await page.leads.visit();
  await page.leads.openLeadModal();
  await page.leads.submitLeadForm("Joao Pretto", "joao.playwright.com");
  await page.leads.alertHaveText("Email incorreto");
});

test("Não deve cadastrar sem nome preenchido", async ({ page }) => {
  await page.leads.visit();
  await page.leads.openLeadModal();
  await page.leads.submitLeadForm("", "joao@playwright.com");
  await page.leads.alertHaveText("Campo obrigatório");
});

test("Não deve cadastrar sem email preenchido", async ({ page }) => {
  await page.leads.visit();
  await page.leads.openLeadModal();
  await page.leads.submitLeadForm("Joao Pretto", "");
  await page.leads.alertHaveText("Campo obrigatório");
});

test("Não deve cadastrar com nenhum campo preenchido", async ({ page }) => {
  await page.leads.visit();
  await page.leads.openLeadModal();
  await page.leads.submitLeadForm("", "");
  await page.leads.alertHaveText(["Campo obrigatório", "Campo obrigatório"]);
});
const { test, expect } = require("../support");
const { getAuthenticatedContext } = require("../helper/auth");
const data = require("../support/fixtures/movies.json");

test("deve poder cadastrar um novo filme", async ({ page}) => {
  const api = await getAuthenticatedContext();
  const movie = data.create;

  const response = await api.get("/movies", {
    params: {
      title: movie.title,
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();

  if (body.total > 0) {
    const id = body.data[0].id;
    const deleteLead = await api.delete(`/movies/${id}`);
    expect(deleteLead.ok()).toBeTruthy;
  }

  await page.login.visit();
  await page.login.submit("admin@zombieplus.com", "pwd123");
  await page.movies.isLoggedIn();

  await page.movies.create(
    movie.title,
    movie.overview,
    movie.company,
    movie.release_year
  );
  await page.toast.haveText("UhullCadastro realizado com sucesso!");
});

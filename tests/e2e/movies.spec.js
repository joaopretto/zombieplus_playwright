const { test, expect } = require("../support");
const { getAuthenticatedContext } = require("../helper/auth");
const data = require("../support/fixtures/movies.json");
const fs = require("fs");

test("deve poder cadastrar um novo filme", async ({ page }) => {
  const { jsonContext } = await getAuthenticatedContext();
  const movie = data.create;

  const response = await jsonContext.get("/movies", {
    params: {
      title: movie.title,
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();

  if (body.total > 0) {
    const id = body.data[0].id;
    const deleteLead = await jsonContext.delete(`/movies/${id}`);
    expect(deleteLead.ok()).toBeTruthy;
  }

  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");

  await page.movies.create(movie);
  await page.popup.haveText(
    `O filme '${movie.title}' foi adicionado ao catálogo.`
  );
});

test("deve poder remover um filme", async ({ page }) => {
  const { jsonContext, formDataContext } = await getAuthenticatedContext();
  const movie = data.to_remove;

  const response = await jsonContext.get("/movies", {
    params: {
      title: movie.title,
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();

  if (body.total == 0) {
    const companyId = await jsonContext.get("/companies", {
      params: {
        name: movie.company,
      },
    });
    expect(companyId.ok()).toBeTruthy();
    const bodyCompany = await companyId.json();

    const formPost = await formDataContext.post("/movies", {
      multipart: {
        cover: fs.createReadStream("tests/support/fixtures/" + movie.cover),
        title: movie.title,
        overview: movie.overview,
        company_id: bodyCompany.data[0].id,
        release_year: movie.release_year,
        featured: movie.featured,
      },
    });

    expect(formPost.ok()).toBeTruthy();
  }

  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");

  await page.movies.remove(movie.title);
  await page.popup.haveText("Filme removido com sucesso.");
});

test("não deve poder cadastrar um novo filme duplicado.", async ({ page }) => {
  const { jsonContext, formDataContext } = await getAuthenticatedContext();
  const movie = data.duplicate;

  const response = await jsonContext.get("/movies", {
    params: {
      title: movie.title,
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();

  if (body.total == 0) {
    const companyId = await jsonContext.get("/companies", {
      params: {
        name: movie.company,
      },
    });
    expect(companyId.ok()).toBeTruthy();
    const bodyCompany = await companyId.json();

    const formPost = await formDataContext.post("/movies", {
      multipart: {
        cover: fs.createReadStream("tests/support/fixtures/" + movie.cover),
        title: movie.title,
        overview: movie.overview,
        company_id: bodyCompany.data[0].id,
        release_year: movie.release_year,
        featured: movie.featured,
      },
    });

    expect(formPost.ok()).toBeTruthy();
  }

  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");

  await page.movies.create(movie);
  await page.popup.haveText(
    `O título '${movie.title}' já consta em nosso catálogo. Por favor, verifique se há necessidade de atualizações ou correções para este item.`
  );
});

test("não deve cadastrar quando os campos obrigatórios não são preenchidos", async ({
  page,
}) => {
  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");

  await page.movies.goForm();
  await page.movies.submit();

  await page.movies.alertHaveText([
    "Campo obrigatório",
    "Campo obrigatório",
    "Campo obrigatório",
    "Campo obrigatório",
  ]);
});

test("deve realizar busca pelo termo zumbi", async ({ page }) => {
  const { jsonContext, formDataContext } = await getAuthenticatedContext();
  const movies = data.search;

  movies.data.forEach(async (x) => {
    const response = await jsonContext.get("/movies", {
      params: {
        title: x.title,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    if (body.total == 0) {
      movies.data.forEach(async (m) => {
        const companyId = await jsonContext.get("/companies", {
          params: {
            name: m.company,
          },
        });
        expect(companyId.ok()).toBeTruthy();
        const bodyCompany = await companyId.json();
        const formPost = await formDataContext.post("/movies", {
          multipart: {
            cover: fs.createReadStream("tests/support/fixtures/" + m.cover),
            title: m.title,
            overview: m.overview,
            company_id: bodyCompany.data[0].id,
            release_year: m.release_year,
            featured: m.featured,
          },
        });
        expect(formPost.ok()).toBeTruthy();
      });
    }
  });

  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");
  await page.movies.search(movies.input);
  await page.movies.tableHave(movies.outputs);
});

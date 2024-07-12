/** Tests for companies. */
const request = require("supertest");

const app = require("../app");
const db = require("../db");

// before each test, clean out data
beforeEach(async () => {
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
  await db.query("SELECT setval('invoices_id_seq', 1, false)");

  await db.query(`INSERT INTO companies (code, name, description)
                      VALUES ('apple', 'Apple', 'Maker of OSX.'),
                             ('ibm', 'IBM', 'Big blue.')`);

  const inv = await db.query(
    `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
               VALUES ('apple', 100, false, '2018-01-01', null),
                      ('apple', 200, true, '2018-02-01', '2018-02-02'),
                      ('ibm', 300, false, '2018-03-01', null)
               RETURNING id`
  );
});

afterAll(async () => {
  await db.end();
});

describe("GET /", function () {
  test("It should respond with array of companies", async function () {
    const response = await request(app).get("/companies");
    expect(response.body).toEqual({
      companies: [
        { code: "apple", name: "Apple" },
        { code: "ibm", name: "IBM" },
      ],
    });
  });
});

describe("GET /apple", function () {
  test("It return company info", async function () {
    const response = await request(app).get("/companies/apple");
    expect(response.body).toEqual({
      company: {
        code: "apple",
        name: "Apple",
        description: "Maker of OSX.",
      },
    });
  });
});

describe("POST /", function () {
  test("Should add a company", async function () {
    const response = await request(app).post("/companies").send({
      code: "msi",
      name: "MSI Computing",
      description: "Leader of technology",
    });

    expect(response.body).toEqual({
      company: {
        code: "msi",
        name: "MSI Computing",
        description: "Leader of technology",
      },
    });
  });
});

describe("PATCH /", function () {
  test("It should update a company", async function () {
    const response = await request(app).patch("/companies/apple").send({
      name: "New Apple Name",
      description: "New Apple Description",
    });
    expect(response.body).toEqual({
      company: {
        code: "apple",
        name: "New Apple Name",
        description: "New Apple Description",
      },
    });
  });
});

describe("DELETE /", function () {
  test("It should delete a company", async function () {
    const response = await request(app).delete("/companies/apple");

    expect(response.body).toEqual({ status: "deleted" });
  });
});

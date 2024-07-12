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
  test("It should respond with all invoices", async function () {
    const response = await request(app).get("/invoices");
    expect(response.body).toEqual({
      invoices: [
        { id: 1, comp_code: "apple" },
        { id: 2, comp_code: "apple" },
        { id: 3, comp_code: "ibm" },
      ],
    });
  });
});

describe("GET /1", function () {
  test("It return specific invoice info", async function () {
    const response = await request(app).get("/invoices/1");
    expect(response.body).toEqual({
      invoice: {
        id: 1,
        comp_code: "apple",
        amt: 100,
        paid: false,
        add_date: "2018-01-01T05:00:00.000Z",
        paid_date: null,
      },
    });
  });
});

describe("POST /", function () {
  test("Should add an invoice", async function () {
    const response = await request(app).post("/invoices").send({
      id: 4,
      comp_code: "ibm",
      amt: 7,
      paid: false,
    });

    expect(response.body).toEqual({
      invoice: {
        id: 4,
        comp_code: "ibm",
        amt: 7,
        add_date: expect.any(String),
        paid: false,
        paid_date: null,
      },
    });
  });
});

describe("PATCH /", function () {
  test("It should update an invoice", async function () {
    const response = await request(app).patch("/invoices/1").send({
      amt: 298103,
    });
    expect(response.body).toEqual({
      invoice: {
        id: 1,
        comp_code: "apple",
        paid: false,
        amt: 298103,
        add_date: expect.any(String),
        paid_date: null,
      },
    });
  });
});

describe("DELETE /", function () {
  test("It should delete an invoice", async function () {
    const response = await request(app).delete("/invoices/1");

    expect(response.body).toEqual({ status: "deleted" });
  });
});

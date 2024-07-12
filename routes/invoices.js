const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query("SELECT id, comp_code FROM invoices");
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query("SELECT * FROM invoices WHERE id = $1", [
      id,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
    }
    return res.send({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      "INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    let { amt, paid } = req.body;
    const results = await db.query("SELECT paid FROM invoices WHERE id =$1", [
      id,
    ]);

    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update invoice with id of ${id}`, 404);
    }

    const paidDate = results.rows[0].paid_date;

    if (!paidDate && paid) {
      payDate = new Date();
    } else if (!paid) {
      payDate = null;
    } else {
      payDate = paidDate;
    }

    const resp = await db.query(
      "UPDATE invoices SET amt = $1, paid = $2, paid_date = $3 WHERE id = $4 RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [amt, paid, payDate, id]
    );

    return res.json({ invoice: resp.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const results = db.query("DELETE FROM invoices WHERE id =$1", [
      req.params.id,
    ]);
    return res.send({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});

router.get("/companies/:code", async (req, res, next) => {
  try {
    const { code } = req.params;

    const compResults = await db.query(
      `SELECT code, name, description FROM companies WHERE code = $1`,
      [code]
    );

    const invResults = await db.query(
      `SELECT id FROM invoices WHERE comp_code = $1`,
      [code]
    );

    if (compResults.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }

    const company = compResults.rows[0];
    const invoices = invResults.rows;

    company.invoices = invoices.map((inv) => inv.id);

    return res.json({ company: company });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

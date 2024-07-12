const express = require("express");
const ExpressError = require("../expressError");
const slugify = require("slugify");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT ind_code as industry,
    array_agg(code) as company FROM companies c
    INNER JOIN departments d ON c.code = d.comp_code
    GROUP BY ind_code;`
    );

    return res.json({ Industries: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, industry_field } = req.body;
    const results = await db.query(
      `INSERT INTO industries (code, industry_field) VALUES ($1, $2) RETURNING code, industry_field`,
      [code, industry_field]
    );
    return res.json({ Industry: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/:ind_code", async (req, res, next) => {
  try {
    const { ind_code } = req.params;
    const { comp_code } = req.body;
    const results = await db.query(
      `INSERT INTO departments (ind_code, comp_code) VALUES ($1, $2) RETURNING ind_code, comp_code`,
      [ind_code, comp_code]
    );
    return res.json({ Department: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

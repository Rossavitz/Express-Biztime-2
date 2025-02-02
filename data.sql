\c biztime

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries(
  code text PRIMARY KEY,
  industry_field text
);

CREATE TABLE departments(
  ind_code text NOT NULL REFERENCES industries ON DELETE CASCADE,
  comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
  PRIMARY KEY(ind_code, comp_code)
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries (code, industry_field)
  VALUES ('acct', 'Accounting'),
         ('hr', 'Human Resources'),
         ('mktg', 'Marketing');

INSERT INTO departments (ind_code, comp_code)
VALUES  ('acct', 'apple'),
        ('hr', 'apple'),
        ('hr', 'ibm'),
        ('mktg', 'ibm');
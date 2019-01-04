'use strict';

const db = require("../database");
const bcrypt = require("bcrypt");

module.exports = {
  handleLogin: async function (req, res) {
    const {userName, password} = req.body;

    if (userName === undefined || password === undefined) {
      const message = "userName or password is undefined.";
      res.status(400);
      res.send(message);
    }

    const query = {
      text: "SELECT password FROM users WHERE name = $1",
      values: [userName]
    };

    const {rows} = await db.query(query);

    // UserName exists
    if (rows != null && rows.length === 1) {
      // Compare stored hash with password
      if (bcrypt.compareSync(password, rows[0].password)) {
        res.status(200);
        res.send("Login successful");
        return;
      }
    }
    res.status(400);
    res.send("Login failed");
  }
};

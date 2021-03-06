'use strict';

const db = require("../database");
const bcrypt = require("bcrypt");

module.exports = {
  handleLogin: async function (req, res) {
    const {userName, password} = req.body;

    if (userName === undefined || password === undefined) {
      const message = "userName or password is undefined.";
      console.log(message);
      res.status(400);
      res.send(message);
      return;
    }

    const query = {
      text: "SELECT user_id, password FROM users WHERE name = $1",
      values: [userName]
    };

    const {rows} = await db.query(query);

    // UserName exists
    if (rows != null && rows.length === 1) {
      // Compare stored hash with password
      if (bcrypt.compareSync(password, rows[0].password)) {
        res.status(200);
        res.json(rows[0].user_id);
        return;
      }
    }
    res.status(400);
    res.send("Login failed");
  }
};

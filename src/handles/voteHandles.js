'use strict';
const db = require("../database");

module.exports = {
  handleVote: async (req, res, queryString, vote) => {
    const {userId, movieId} = req.body;

    if (movieId != null && userId != null) {
      const query = {
        text: queryString,
        values: [movieId, userId, vote]
      };

      const {rows} = await db.query(query);

      if (rows != null) {
        const message = "Successfully inserted " + (vote ? "upVote" : "downVote");
        console.log(message);
        res.status(200);
        res.send(message);
      }
      else {
        const message = "Error while inserting " + (vote ? "upVote" : "downVote");
        console.log(message);
        res.status(500);
        res.send(message);
      }
    }
    else {
      const message = "Malformed request. It has to include a valid userId and movieId.";
      console.log(message);
      res.status(400);
      res.send(message);
    }
  }
};
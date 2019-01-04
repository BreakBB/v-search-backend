'use strict';

const db = require("../../database");

const voteInsertQuery = 'INSERT INTO votes (movie_id, user_id, vote) VALUES ($1, $2, $3)';

module.exports = {
  handleUpVote: async function (req, res) {
    console.log("Handling upVote");
    await handleVote(req, res, true);
  },
  handleDownVote: async function (req, res) {
    console.log("Handling downVote");
    await handleVote(req, res, false);
  }
};

const handleVote = async (req, res, vote) => {
  const movieId = req.params.id;
  const userId = req.body.userId;

  if (movieId != null && userId != null) {
    const query = {
      text: voteInsertQuery,
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
    const message = "Malformed request. It has to include a valid userId and the route must be a valid movie_id.";
    console.log(message);
    res.status(400);
    res.send(message);
  }
};
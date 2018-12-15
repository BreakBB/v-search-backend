'use strict';
const db = require("../database");

module.exports = {
  getAllMoviesDE: async function (req, res) {
    console.log("Searching for movies...");
    const { rows } = await db.query('SELECT * FROM amazon_video_de', null);

    if (rows != null) {
      console.log("Found", rows.length, "entries.");
      res.status(200);
      res.json(rows);
    }
    else {
      const message = "Found no entries in the DB.";
      console.log(message);
      res.status(400);
      res.send(message)
    }
  },
  getFilteredMoviesDE: async function (req, res) {
    const filter = buildFilter(req.body);

    const query = {
      text: 'SELECT * FROM amazon_video_de' +
            ' WHERE ($1 OR title = $2)' +
            ' AND ($3 OR rating >= $4)' +
            ' AND ($5 OR imdb >= $6)' +
            ' AND ($7 OR $8 = ANY(genres))' +
            ' AND ($9 OR year = $10)' +
            ' AND ($11 OR fsk <= $12)',
      values: filter
    };

    console.log("QUERY: ", query.values.reduce((q, v, i) => q.replace(`$${i + 1}`, v), query.text));

    console.log("Searching for movies...");
    const { rows } = await db.query(query);

    if (rows != null) {
      console.log("Found", rows.length, "entries.");
      res.status(200);
      res.json(rows);
    }
    else {
      const message = "Found no entries matching the filter.";
      console.log(message);
      res.status(400);
      res.send(message)
    }
  }
};

function buildFilter(b){
  let filter = [];

  const TRUE = "TRUE";
  const FALSE = "FALSE";
  const NULL = "NULL";

  if(b.title == null){
    filter.push(TRUE, NULL);
  }
  else{
    filter.push(FALSE, b.title);
  }

  if(b.rating == null){
    filter.push(TRUE, 0);
  }
  else{
    filter.push(FALSE, b.rating);
  }

  if(b.imdb == null){
    filter.push(TRUE, 0);
  }
  else{
    filter.push(FALSE, b.imdb);
  }

  if(b.genres == null){
    filter.push(TRUE, NULL);
  }
  else{
    filter.push(FALSE, b.genres);
  }

  if(b.year == null){
    filter.push(TRUE, 0);
  }
  else{
    filter.push(FALSE, b.year);
  }

  if(b.fsk == null){
    filter.push(TRUE, 0);
  }
  else{
    filter.push(FALSE, b.fsk);
  }
  return filter;
}
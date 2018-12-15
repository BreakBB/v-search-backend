'use strict';
const db = require("../database");

module.exports = {
  getAllMoviesDE: async function (req, res) {
    console.log("Searching for movies...");
    const {rows} = await db.query('SELECT * FROM amazon_video_de', null);

    if (rows != null) {
      console.log("Found", rows.length, "entries.");
      res.status(200);
      res.json(rows);
    }
    else {
      const message = "Found no entries in the DB.";
      console.error(message);
      res.status(400);
      res.send(message)
    }
  },
  getFilteredMoviesDE: async function (req, res) {
    const filter = buildFilter(req.body);

    const query = {
      text: 'SELECT * FROM amazon_video_de' +
      ' WHERE ($1 OR title LIKE $2)' +
      ' AND ($3 OR rating >= $4)' +
      ' AND ($5 OR imdb >= $6)' +
      ' AND ($7 OR genres @> $8::varchar[])' +
      ' AND ($9 OR year = $10)' +
      ' AND ($11 OR fsk <= $12)',
      values: filter
    };

    console.log("QUERY: ", query.values.reduce((q, v, i) => q.replace(`$${i + 1}`, v), query.text));

    console.log("Searching for movies...");
    const {rows} = await db.query(query);

    if (rows != null) {
      console.log("Found", rows.length, "entries.");
      res.status(200);
      res.json(rows);
    }
    else {
      const message = "Found no entries matching the filter.";
      console.error(message);
      res.status(400);
      res.send(message)
    }
  },
  getAllGenres: async function (req, res) {
    console.log("Searching for genres...");
    const {rows} = await db.query('SELECT DISTINCT unnest(genres) FROM amazon_video_de', null);

    if (rows != null) {
      console.log("Found", rows.length, "genres.");

      let genres = [];

      for (let row of rows) {
        genres.push(row.unnest)
      }

      res.status(200);
      res.json(genres);
    }
    else {
      const message = "Found no genres in the DB. Is the DB empty?";
      console.error(message);
      res.status(400);
      res.send(message)
    }
  }
};

function buildFilter(b) {
  console.log("Got body: ", b);
  let filter = [];

  const TRUE = "TRUE";
  const FALSE = "FALSE";
  const NULL = "NULL";

  if (b.title == null) {
    filter.push(TRUE, NULL);
  }
  else {
    const stopWords = b.title.split(' ');
    let titleString = "";
    for(const word of stopWords){
      titleString = titleString + "%" + word + "%";
    }

    filter.push(FALSE, titleString);
  }

  if (b.rating == null) {
    filter.push(TRUE, 0);
  }
  else {
    filter.push(FALSE, b.rating);
  }

  if (b.imdb == null) {
    filter.push(TRUE, 0);
  }
  else {
    filter.push(FALSE, b.imdb);
  }

  if (b.genres == null) {
    filter.push(TRUE, "");
  }
  else {
    filter.push(FALSE, b.genres);
  }

  if (b.year == null) {
    filter.push(TRUE, 0);
  }
  else {
    filter.push(FALSE, b.year);
  }

  if (b.fsk == null) {
    filter.push(TRUE, 0);
  }
  else {
    filter.push(FALSE, b.fsk);
  }
  return filter;
}
'use strict';

const db = require("../database");
const spawn = require('child_process').spawn;

module.exports = {
  handleGeneralUpdate: async function (req, res) {
    const {rows} = await db.query('SELECT movie_id, rating, imdb, genres, year, fsk, movie_type FROM amazon_video_de LIMIT 20', null);

    if (rows != null) {
      console.log("Spawning python process");
      const pythonProcess = spawn("py", ["v_commender/main.py", JSON.stringify(rows)], {"cwd": "../../v_commender"});

      pythonProcess.stdout.on('data', (data) => {
        const json = JSON.parse(data.toString());
        res.status(200);
        res.json({"rows": rows, "data": json});
      });

      pythonProcess.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
        res.status(500);
        res.json(data);
      });

      pythonProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });
    }
    else {
      const message = "Found no entries in the DB.";
      console.error(message);
      res.status(400);
      res.send(message)
    }
  }
};
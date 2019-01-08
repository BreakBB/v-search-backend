'use strict';

module.exports = {
  SELECT_ALL: "SELECT * FROM amazon_video_de",
  TABLE_VIDEO: "amazon_video_de",
  TABLE_VOTES: "votes_de",
  INSERT_VOTE: "INSERT INTO votes_de (movie_id, user_id, vote) VALUES ($1, $2, $3)",
  SELECT_GENRES: "SELECT DISTINCT unnest(genres) FROM amazon_video_de",
  SELECT_NUMBER: "SELECT number FROM amazon_video_de a"
};
'use strict';

module.exports = {
  SELECT_ALL: "SELECT * FROM amazon_video_com",
  TABLE_VIDEO: "amazon_video_com",
  TABLE_VOTES: "votes_com",
  INSERT_VOTE: "INSERT INTO votes_com (movie_id, user_id, vote) VALUES ($1, $2, $3) ON CONFLICT (movie_id, user_id) DO UPDATE SET vote = $4 RETURNING user_id",
  SELECT_GENRES: "SELECT DISTINCT unnest(genres) FROM amazon_video_com",
  SELECT_NUMBER: "SELECT number FROM amazon_video_com a",
  ARRAY_GENRE_IDS: "  ARRAY(\n" +
  "      SELECT genre_id\n" +
  "      FROM genres\n" +
  "        INNER JOIN amazon_video_com ac_tmp ON genres.name = ANY (ac_tmp.genres)\n" +
  "      WHERE a.movie_id = ac_tmp.movie_id\n" +
  "  ) as genre_ids,\n",
  ARRAY_ACTOR_IDS: "  ARRAY(\n" +
  "      SELECT actor_id\n" +
  "      FROM actors\n" +
  "        INNER JOIN amazon_video_com ac_tmp ON actors.name = ANY (ac_tmp.actors)\n" +
  "      WHERE a.movie_id = ac_tmp.movie_id\n" +
  "  ) as actor_ids,\n",
  ARRAY_WRITER_IDS: "  ARRAY(\n" +
  "      SELECT writer_id\n" +
  "      FROM writers\n" +
  "        INNER JOIN amazon_video_com ac_tmp ON writers.name = ANY (ac_tmp.writer)\n" +
  "      WHERE a.movie_id = ac_tmp.movie_id\n" +
  "  ) as writer_ids,\n",
  ARRAY_DIRECTOR_IDS: "  ARRAY(\n" +
  "      SELECT director_id\n" +
  "      FROM directors\n" +
  "        INNER JOIN amazon_video_com ac_tmp ON directors.name = ANY (ac_tmp.directors)\n" +
  "      WHERE a.movie_id = ac_tmp.movie_id\n" +
  "  ) as director_ids\n",
  WHERE_CARDINALITY: " cardinality(a.genres) > 0 AND cardinality(a.actors) > 2 AND cardinality(a.writer) > 1 " +
  "AND cardinality(a.directors) > 0"
};
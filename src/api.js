const express = require("express");
const cors = require("cors");
const db = require("./db");
const path = require("path");
const { buildRangeFilter, fillMissingDates } = require("./utils/dateRange");
const { ensureAlbumCover } = require("./services/albumCoverCache");
const { ensureArtistImage } = require("./services/artistImageCache");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));

function buildDateFilter(year, month) {
  let where = "";
  const params = [];

  if (year) {
    where += "strftime('%Y', played_at, 'unixepoch') = ?";
    params.push(String(year));
  }

  if (month) {
    if (where) where += " AND ";
    where += "strftime('%m', played_at, 'unixepoch') = ?";
    params.push(String(month).padStart(2, "0"));
  }

  return { where, params };
}

app.get("/api/top-artists", async (req, res) => {
  const rows = db.prepare(`
    SELECT artist, COUNT(*) plays
    FROM scrobbles
    GROUP BY artist
    ORDER BY plays DESC
    LIMIT 10
  `).all();

  for (const r of rows) {
    r.image = await ensureArtistImage(r.artist);
  }

  res.json(rows);
});


app.get("/api/top-tracks", async (req, res) => {
  const { year, month, range } = req.query;
  const AVG_TRACK_SECONDS = 180;

  const filter = range
    ? buildRangeFilter(range)
    : buildDateFilter(year, month);

  const rows = db.prepare(`
    SELECT
      track,
      artist,
      album,
      album_image,
      COUNT(*) plays,
      COUNT(*) * ? total_seconds
    FROM scrobbles
    WHERE album IS NOT NULL
    ${filter.where ? `AND ${filter.where}` : ""}
    GROUP BY track, artist, album
    ORDER BY plays DESC
    LIMIT 20
  `).all(AVG_TRACK_SECONDS, ...(filter.params || []));

  for (const row of rows) {
    if (!row.album_image) {
      row.album_image = await ensureAlbumCover(row.artist, row.album);
    }
  }

  res.json(rows);
});

app.get("/api/plays-per-day", (req, res) => {
  const { year, month, range } = req.query;

  let filter;
  if (range) {
    filter = buildRangeFilter(range);
  } else {
    filter = buildDateFilter(year, month);
  }

  const rows = db.prepare(`
    SELECT
      date(played_at, 'unixepoch') day,
      COUNT(*) plays
    FROM scrobbles
    ${filter.where ? `WHERE ${filter.where}` : ""}
    GROUP BY day
    ORDER BY day
  `).all(...(filter?.params || []));

  if (range) {
    const filledRows = fillMissingDates(rows, range);
    return res.json(filledRows);
  }

  res.json(rows);
});


app.get("/api/summary", (req, res) => {
  const { year, month, range } = req.query;

  let filter;
  if (range) {
    filter = buildRangeFilter(range);
  } else {
    filter = buildDateFilter(year, month);
  }

  const AVG_TRACK_SECONDS = 180;

  const row = db.prepare(`
    SELECT
      COUNT(*) totalPlays,
      COUNT(DISTINCT date(played_at, 'unixepoch')) days
    FROM scrobbles
    ${filter.where ? `WHERE ${filter.where}` : ""}
  `).get(...(filter?.params || []));

  const totalSeconds = row.totalPlays * AVG_TRACK_SECONDS;
  
  const totalMinutes = Math.round(totalSeconds / 60); 
  
  const avgPerDay = row.days
    ? (row.totalPlays / row.days).toFixed(1)
    : 0;

  res.json({
    totalPlays: row.totalPlays,
    totalMinutes: totalMinutes,
    avgPerDay
  });
});

app.get("/api/top-albums", async (req, res) => {
  const { year, month, range } = req.query;

  let filter;
  if (range) {
    filter = buildRangeFilter(range);
  } else {
    filter = buildDateFilter(year, month);
  }

  const filterClause = filter.where ? `AND ${filter.where}` : '';
  
  const albums = db.prepare(`
    SELECT artist, album, album_image, COUNT(*) plays
    FROM scrobbles
    WHERE album IS NOT NULL
    ${filterClause} 
    GROUP BY artist, album
    ORDER BY plays DESC
    LIMIT 12
  `).all(...filter.params);

  for (const a of albums) {
    if (!a.album_image) {
      a.album_image = await ensureAlbumCover(a.artist, a.album);
    }
  }

  res.json(albums);
});


app.listen(3000, () => {
  console.log("Dashboard em http://localhost:3000");
});
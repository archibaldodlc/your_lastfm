const db = require("../db");
const { fetchSpotifyArtistImage } = require("./spotifyArtistImage");

async function ensureArtistImage(artist) {
  console.log("\n[ArtistImage] START:", artist);

  const cached = db.prepare(`
    SELECT artist_image
    FROM artists
    WHERE artist = ?
  `).get(artist);

  if (cached?.artist_image) {
    console.log("[ArtistImage] CACHE HIT");
    return cached.artist_image;
  }

  console.log("[ArtistImage] FETCH SPOTIFY");

  const image = await fetchSpotifyArtistImage(artist);

  if (!image) {
    console.log("[ArtistImage] NOT FOUND ON SPOTIFY");
    return null;
  }

  db.prepare(`
    INSERT OR REPLACE INTO artists (artist, artist_image)
    VALUES (?, ?)
  `).run(artist, image);

  console.log("[ArtistImage] SAVED:", image);

  return image;
}

module.exports = { ensureArtistImage };

const axios = require("axios");

async function fetchDeezerArtistImage(artist) {
  try {
    const res = await axios.get("https://api.deezer.com/search/artist", {
      params: {
        q: artist,
        limit: 1
      }
    });

    const item = res.data?.data?.[0];

    if (!item) return null;

    return item.picture_xl || item.picture_big || null;

  } catch (error) {
    console.error(`Error searching for image on Deezer for ${artist}:`, error.message);
    return null;
  }
}

module.exports = { fetchArtistImage: fetchDeezerArtistImage };
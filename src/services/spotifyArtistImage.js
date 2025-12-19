const axios = require("axios");
const qs = require("qs");

let tokenCache = {
  token: null,
  expiresAt: 0
};

async function getSpotifyToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    qs.stringify({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  tokenCache.token = res.data.access_token;
  tokenCache.expiresAt = Date.now() + res.data.expires_in * 1000;

  return tokenCache.token;
}

async function fetchSpotifyArtistImage(artist) {
  const token = await getSpotifyToken();

  const res = await axios.get(
    "https://api.spotify.com/v1/search",
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: artist,
        type: "artist",
        limit: 1
      }
    }
  );

  const item = res.data?.artists?.items?.[0];
  if (!item) return null;

  return item.images?.[0]?.url || null;
}

module.exports = { fetchSpotifyArtistImage };

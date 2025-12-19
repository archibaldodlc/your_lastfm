import { buildQuery } from "./filters.js";

export async function loadTopSongs() {
  const res = await fetch("/api/top-tracks" + buildQuery());
  const data = await res.json();

  const container = document.getElementById("top-songs");
  container.innerHTML = "";

  data.forEach((row, i) => {
    const minutes = Math.floor(row.total_seconds / 60);
    const seconds = row.total_seconds % 60;

    container.innerHTML += `
        <div class="top-song-row">
            <span class="song-position">${i + 1}</span>

            <div class="song-main">
            <img
                src="${row.album_image || 'https://www.beatstars.com/assets/img/placeholders/playlist-placeholder.svg'}"
                class="song-cover"
            />
            <div>
                <div class="song-title">${row.track}</div>
                <div class="song-artist">${row.artist}</div>
            </div>
            </div>

            <span>${row.plays}</span>
            <span>${minutes}:${String(seconds).padStart(2, "0")}</span>
        </div>
    `;
  });
}
import { initFilters } from "./filters.js";
import { loadSummary } from "./summary.js";
import { loadAlbums } from "./albums.js";
import { loadChart } from "./charts.js";
import { loadTopSongs } from "./topSongs.js";
import { loadTopArtists } from "./artists.js";

const loading = document.getElementById("global-loading");

async function reload() {
  loading.style.display = "flex";

  await Promise.all([
    loadSummary(),
    loadAlbums(),
    loadTopSongs(),
    loadTopArtists(),
    loadChart({
      url: "/api/plays-per-day",
      canvasId: "daily",
      labelKey: "day",
      valueKey: "plays",
      label: "Plays por dia"
    })
  ]);

  loading.style.display = "none";
}

initFilters(() => {
  reload();
});

reload();

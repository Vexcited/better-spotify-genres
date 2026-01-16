import camelize from "./utils/camelize";
import type { CustomWindow } from "./window";
import { fetchTagsFromMusicBrainz } from "./api/musicbrainz";
declare let window: CustomWindow;

const log = (level: "info" | "warn" | "error", ...args: Array<any>) => {
  const prefix = "\x1b[35m[better-spotify-genres]\x1b[0m";
  console[level](prefix, ...args);
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function initializeSpotifyGenres(): Promise<void> {
  // Make sure everything is loaded.
  if (!(Spicetify.Platform && Spicetify.URI && Spicetify.Player.data)) {
    setTimeout(initializeSpotifyGenres, 300);
    return;
  }

  window._onGenreItemMouseOver = (el) => {
    el.style.setProperty("color", "var(--spice-text)");
  };
  window._onGenreItemMouseOut = (el) => {
    el.style.setProperty("color", "var(--spice-subtext)");
  };

  function getLocalStorageDataFromKey(key: string): string | null {
    return Spicetify.LocalStorage.get(key);
  }

  function setLocalStorageDataWithKey(key: string, value: string): void {
    Spicetify.LocalStorage.set(key, value);
  }

  function getConfig(): Partial<typeof defaultConfiguration> {
    try {
      const data = JSON.parse(
        getLocalStorageDataFromKey("showGenre:settings") ?? "{}",
      );
      return data;
    } catch {
      setLocalStorageDataWithKey("showGenre:settings", "{}");
      return {};
    }
  }

  const defaultConfiguration = {
    cached: {
      pop: "spotify:playlist:6gS3HhOiI17QNojjPuPzqc",
    } as Record<string, string>,
  };

  // Gather current configuration inside a global variable.
  let CONFIG = getConfig() as typeof defaultConfiguration;

  function saveConfig<T extends keyof typeof defaultConfiguration>(
    item?: T,
    value?: (typeof defaultConfiguration)[T],
  ): void {
    if (item) {
      let tempConfig = getConfig();
      tempConfig[item] = value;

      setLocalStorageDataWithKey(
        "showGenre:settings",
        JSON.stringify(tempConfig),
      );
      return;
    }

    setLocalStorageDataWithKey("showGenre:settings", JSON.stringify(CONFIG));
  }

  // Assign the default configuration is key is missing.
  Object.keys(defaultConfiguration).forEach((item) => {
    const key = item as keyof typeof defaultConfiguration;

    if (typeof CONFIG[key] === "undefined") {
      CONFIG = { ...CONFIG, [key]: defaultConfiguration[key] };
    }
  });

  // Save the default configuration in localStorage.
  saveConfig();

  /**
   * Find an element in the DOM and wait if not found for now.
   * @returns `null` if not found after a certain time.
   */
  async function waitForElement<T extends HTMLElement = HTMLElement>(
    selector: string,
    timeout: number | null = null,
    location = document.body,
  ): Promise<T | null> {
    return new Promise<T | null>((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector) as T | null);
      }

      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector) as T | null);
          observer.disconnect();
        } else {
          if (typeof timeout === "number") {
            setTimeout(() => {
              observer.disconnect();
              resolve(null);
            }, timeout);
          }
        }
      });

      observer.observe(location, {
        childList: true,
        subtree: true,
      });
    });
  }

  /**
   * Get genre playlist made by "The Sounds of Spotify".
   */
  async function fetchSoundOfSpotifyPlaylist(
    genre: string,
  ): Promise<{ uri: string | null; genre: string }> {
    const cached = CONFIG.cached[camelize(genre)];
    if (cached !== null && cached !== undefined) {
      return { uri: cached, genre };
    }

    const re = new RegExp(
      `^the sound of ${genre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      "i",
    );

    // for some reason
    const res = await Spicetify.GraphQL.Request(
      // Spicetify.GraphQL.Definitions.searchDesktop,
      {
        name: "searchDesktop",
        operation: "query",
        sha256Hash:
          "fcad5a3e0d5af727fb76966f06971c19cfa2275e6ff7671196753e008611873c",
        value: null,
      },
      {
        searchTerm: `The Sound of ${genre}`,
        limit: 1,
        offset: 0,
        numberOfTopResults: 1,
        includeArtistHasConcertsField: false,
        includeAudiobooks: false,
        includeAuthors: false,
        includePreReleases: false,
      },
    );

    for (const { data: item } of res.data.searchV2.playlists.items) {
      if (
        item.ownerV2.data.username === "thesoundsofspotify" &&
        re.test(item.name)
      ) {
        // Add the URI in cache.
        CONFIG.cached[camelize(genre)] = item.uri;

        // Save the cache into localStorage.
        saveConfig("cached", CONFIG.cached);
        return { uri: item.uri, genre };
      } else {
        return { uri: item.uri + "|||", genre };
      }
    }

    return { uri: null, genre };
  }

  async function injectGenres() {
    const { artist_name: artistName, title: trackName } =
      Spicetify.Player.data.item.metadata;

    const genres = await fetchTagsFromMusicBrainz(artistName, trackName);

    if (genres.length === 0) {
      log(
        "warn",
        "No genres found for the current track, removing genres from UI...",
      );
      await clearGenres();
      return;
    }

    const soundOfSpotifyPlaylistsPromises = await Promise.all(
      genres.map((genre) => fetchSoundOfSpotifyPlaylist(genre)),
    );

    const soundOfSpotifyPlaylists = soundOfSpotifyPlaylistsPromises.filter(
      (item) => item.uri !== null,
    ) as Array<{
      uri: string;
      genre: string;
    }>;

    const allGenreElementsHTML = soundOfSpotifyPlaylists
      .map(
        (playlist) =>
          `<a href="${playlist.uri.includes("|||") ? "#" : playlist.uri}" onmouseover="_onGenreItemMouseOver(this)" onmouseout="_onGenreItemMouseOut(this)" style="color: var(--spice-subtext)">${playlist.genre.replace(
            /(^\w{1})|([\s-]+\w{1})/g,
            (letter) => letter.toUpperCase(),
          )}</a>`,
      )
      .join("<span>, </span>");

    if (!trackGenresContainer)
      trackGenresContainer = document.createElement("div");
    trackGenresContainer.innerHTML = allGenreElementsHTML;

    await assertTrackInfoContainer();
    if (trackInfoContainer !== null) {
      trackGenresContainer.style.fontSize = "12px";
      trackGenresContainer.style.color = "var(--spice-misc)";
      trackGenresContainer.style.setProperty("color", "var(--spice-subtext)");

      // Add the ellipsis to make sure it does not overflow.
      trackGenresContainer.classList.add("ellipsis-one-line");

      // Add the `genres` area to the container to match the info container.
      trackGenresContainer.style.setProperty("grid-area", "genres");

      {
        // Modify the grid template for the info container, to add genres !
        let [template, properties] = window
          .getComputedStyle(trackInfoContainer)
          .getPropertyValue("grid-template")
          .split("/")
          .map((item) => item.trim());

        const TEMPLATE = '"genres genres"';
        const QUALITY_TEMPLATE = '"quality quality"';
        if (!template.endsWith(TEMPLATE)) {
          if (template.includes(QUALITY_TEMPLATE)) {
            template = template.replace(
              QUALITY_TEMPLATE,
              `${TEMPLATE} ${QUALITY_TEMPLATE}`,
            );
          } else {
            template += ` ${TEMPLATE}`;
          }
        }

        const gridTemplate = `${template} / ${properties}`;
        trackInfoContainer.style.setProperty("grid-template", gridTemplate);
      }

      trackInfoContainer.appendChild(trackGenresContainer);
    }
  }

  /**
   * Container containing the current track
   * information in the player bar.
   */
  let trackInfoContainer: HTMLDivElement | null = null;

  /**
   * Container inside the track information container
   * that'll contain the injected genres.
   *
   * Generated when injecting the genres for the first time!
   */
  let trackGenresContainer: HTMLDivElement | null = null;

  /**
   * Make sure the track information container is available before
   * running anything else.
   */
  const assertTrackInfoContainer = async (): Promise<void> => {
    const containers = await Promise.all([
      waitForElement<HTMLDivElement>("div.main-trackInfo-container", 1000),
      waitForElement<HTMLDivElement>(
        "div.main-nowPlayingWidget-trackInfo",
        1000,
      ),
    ]);

    const container = containers.find((item) => item !== null);

    if (!container) {
      log(
        "error",
        "Couldn't find the info container, genres will not be displayed.",
      );
      trackInfoContainer = null;
      return;
    }

    trackInfoContainer = container;
  };

  async function clearGenres(): Promise<void> {
    await assertTrackInfoContainer();

    try {
      if (trackInfoContainer === null || trackGenresContainer === null) return;
      trackInfoContainer.style.removeProperty("grid-template");
      trackInfoContainer.removeChild(trackGenresContainer);

      trackGenresContainer = null;
      trackInfoContainer = null;
    } catch {}
  }

  /**
   * Trigger whenever a new song is played
   * or when Spicetify is initialized.
   */
  async function updateGenres(): Promise<void> {
    if (
      // 1. ignore local files
      Spicetify.Player.data.item.metadata.is_local ||
      // 2. ignore everything that is not a track
      Spicetify.URI.fromString(Spicetify.Player.data.item.uri).type !== "track"
    ) {
      log("warn", "Current track is local, removing genres from UI...");
      await clearGenres();
      return;
    }

    await injectGenres();
  }

  while (!Spicetify.Player.data) {
    await wait(1000);
  }

  updateGenres();
  Spicetify.Player.addEventListener("songchange", updateGenres);

  log("info", "Initialized");
}

initializeSpotifyGenres();

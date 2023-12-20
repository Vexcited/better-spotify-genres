"use strict";

// src/api/artistGenres.ts
async function fetchArtistGenres(artistURI) {
  const response = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/artists/${artistURI}`);
  return response.genres;
}

// src/api/lastFM.ts
var LFMApiKey = "44654ea047786d90338c17331a5f5d95";
async function fetchDataFromLastFM(artistName, trackName) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LFMApiKey}&artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(trackName)}&format=json`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// src/utils/camelize.ts
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function camelize(str) {
  return capitalizeFirstLetter(
    str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
  );
}

// src/index.ts
(async function spotifyGenres() {
  if (!(Spicetify.CosmosAsync && Spicetify.Platform && Spicetify.URI && Spicetify.Player.data)) {
    setTimeout(spotifyGenres, 300);
    return;
  }
  window.genrePopup = () => genrePopup();
  window.artistPageGenreOnClick = (dataValue) => artistPageGenreOnClick(dataValue);
  let allGenresForPopupModal = [];
  let lastFmTags = [];
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="17px" height="17px" viewBox="0 0 892.000000 877.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,877.000000) scale(0.100000,-0.100000)" fill="currentcolor" stroke="none"><path d="M4365 8296 c-86 -27 -154 -88 -193 -174 -16 -34 -17 -213 -22 -2550 l-5 -2512 -75 53 c-279 197 -634 329 -1015 378 -129 17 -481 17 -610 0 -901 -116 -1574 -677 -1681 -1402 -92 -628 306 -1259 991 -1566 225 -102 440 -162 690 -194 129 -17 481 -17 610 0 674 86 1226 421 1513 916 86 149 149 344 171 530 7 61 11 686 11 1946 l0 1857 1413 -530 c916 -344 1430 -532 1463 -535 115 -12 238 58 290 164 l29 58 0 775 c0 720 -1 781 -19 855 -59 257 -147 430 -310 617 -115 131 -252 235 -409 308 -81 38 -2546 965 -2662 1001 -69 22 -123 23 -180 5z m2578 -1545 c169 -74 303 -227 374 -427 l28 -79 3 -501 3 -502 -1298 487 -1298 487 -3 681 -2 681 1072 -403 c590 -222 1094 -412 1121 -424z m-3963 -3856 c593 -78 1044 -400 1150 -820 118 -470 -282 -947 -930 -1109 -805 -201 -1677 171 -1830 779 -118 471 289 955 937 1111 219 53 461 67 673 39z"/></g></svg>`;
  const iconActive = `<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="17px" height="17px" viewBox="0 0 892.000000 877.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,877.000000) scale(0.100000,-0.100000)" fill="currentcolor" stroke="none"><path d="M4365 8296 c-86 -27 -154 -88 -193 -174 -16 -34 -17 -213 -22 -2550 l-5 -2512 -75 53 c-279 197 -634 329 -1015 378 -129 17 -481 17 -610 0 -901 -116 -1574 -677 -1681 -1402 -92 -628 306 -1259 991 -1566 225 -102 440 -162 690 -194 129 -17 481 -17 610 0 674 86 1226 421 1513 916 86 149 149 344 171 530 7 61 11 686 11 1946 l0 1857 1413 -530 c916 -344 1430 -532 1463 -535 115 -12 238 58 290 164 l29 58 0 775 c0 720 -1 781 -19 855 -59 257 -147 430 -310 617 -115 131 -252 235 -409 308 -81 38 -2546 965 -2662 1001 -69 22 -123 23 -180 5z"/></g></svg>`;
  const React = Spicetify.React;
  function getLocalStorageDataFromKey(key) {
    return Spicetify.LocalStorage.get(key);
  }
  function setLocalStorageDataWithKey(key, value) {
    Spicetify.LocalStorage.set(key, value);
  }
  function getConfig() {
    try {
      const data = JSON.parse(getLocalStorageDataFromKey("showGenre:settings") ?? "{}");
      return data;
    } catch {
      setLocalStorageDataWithKey("showGenre:settings", "{}");
      return {};
    }
  }
  const defaultConfiguration = {
    state: true,
    cached: {
      pop: "spotify:playlist:6gS3HhOiI17QNojjPuPzqc"
    }
  };
  let CONFIG = getConfig();
  function saveConfig(item, value) {
    if (item) {
      let tempConfig = getConfig();
      tempConfig[item] = value;
      setLocalStorageDataWithKey("showGenre:settings", JSON.stringify(tempConfig));
      return;
    }
    setLocalStorageDataWithKey("showGenre:settings", JSON.stringify(CONFIG));
  }
  Object.keys(defaultConfiguration).forEach((item) => {
    const key = item;
    if (typeof CONFIG[key] === "undefined") {
      CONFIG = { ...CONFIG, [key]: defaultConfiguration[key] };
    }
  });
  saveConfig();
  async function waitForElement(selector, timeout = null, location = document.body) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }
      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
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
        subtree: true
      });
    });
  }
  async function fetchSoundOfSpotifyPlaylist(genre) {
    const cached = CONFIG.cached[camelize(genre)];
    if (cached !== null && cached !== void 0) {
      return { uri: cached, genre };
    }
    const re = new RegExp(`^the sound of ${genre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    const res = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent("The Sound of " + genre)}&type=playlist`);
    for (const item of res.playlists.items) {
      if (item.owner.id === "thesoundsofspotify" && re.test(item.name)) {
        CONFIG.cached[camelize(genre)] = item.uri;
        saveConfig("cached", CONFIG.cached);
        return { uri: item.uri, genre };
      } else {
        return { uri: item.uri + "|||", genre };
      }
    }
    return { uri: null, genre };
  }
  function getAllArtistsURIFromCurrentTrack() {
    const metadata = Spicetify.Player.data.item.metadata;
    const artistsURI = [metadata.artist_uri];
    for (let i = 1; i < 10; i++) {
      const indexURI = `artist_uri:${i}`;
      const artistURI = metadata[indexURI];
      if (artistURI)
        artistsURI.push(artistURI);
      else
        break;
    }
    return artistsURI;
  }
  async function getAllArtistsGenres(allArtistURI, src = null) {
    const allGenresPromises = allArtistURI.map((uri) => fetchArtistGenres(uri.split(":")[2]));
    const allGenresCombined = await Promise.all(allGenresPromises);
    let allGenres = allGenresCombined.flat();
    if (allGenres.length === 0) {
      let targetedArtistID;
      if (src === "artist") {
        targetedArtistID = allArtistURI[0].split(":")[2];
      } else if (src === "recursive") {
        return [];
      } else {
        targetedArtistID = Spicetify.Player.data.item.metadata.artist_uri.split(":")[2];
      }
      const artistResponse = await Spicetify.CosmosAsync.get(`wg://artist/v1/${targetedArtistID}/desktop?format=json`);
      if (!artistResponse.related_artists.artists) {
        return [];
      }
      let tempAllArtistURI = artistResponse.related_artists?.artists.map((artist) => artist.uri);
      let count = 5;
      while (count !== 25) {
        allGenres = await getAllArtistsGenres(tempAllArtistURI.slice(count - 5, count), "recursive");
        if (allGenres.length != 0) {
          count = 25;
        } else {
          count += 5;
        }
      }
    }
    allGenres = Array.from(new Set(allGenres));
    if (!src)
      allGenresForPopupModal = allGenres;
    return allGenres.slice(0, 5);
  }
  async function injectGenre() {
    let allArtistURI = getAllArtistsURIFromCurrentTrack();
    let allGenres = await getAllArtistsGenres(allArtistURI);
    if (!allGenres) {
      allGenresForPopupModal = [];
      removeGenresFromUI();
      return;
    }
    const soundOfSpotifyPlaylistsPromises = await Promise.all(allGenres.map((genre) => fetchSoundOfSpotifyPlaylist(genre)));
    const soundOfSpotifyPlaylists = soundOfSpotifyPlaylistsPromises.filter((item) => item.uri !== null);
    const allGenreElementsCombined = soundOfSpotifyPlaylists.map((playlist) => [
      [
        `<a href="${playlist.uri.includes("|||") ? '#" onclick="genrePopup()" ' : playlist.uri + '"'} style="color: var(--spice-subtext); font-size: 12px">${playlist.genre.replace(
          /(^\w{1})|([\s-]+\w{1})/g,
          (letter) => letter.toUpperCase()
        )}</a>`
      ],
      [`<span>, </span>`]
    ]);
    const allGenreElements = allGenreElementsCombined.flat(Infinity);
    if (allGenreElements[allGenreElements.length - 1] == "<span>, </span>") {
      allGenreElements.pop();
    }
    const allGenreElementsHTML = allGenreElements.join("");
    if (genreContainer)
      genreContainer.innerHTML = allGenreElementsHTML;
    infoContainer = await waitForElement("div.main-trackInfo-container", 1e3);
    if (genreContainer)
      infoContainer?.appendChild(genreContainer);
  }
  const settingsMenuCSS = React.createElement(
    "style",
    null,
    `.popup-row::after {
          content: "";
          display: table;
          clear: both;
      }
      .popup-row .col {
          display: flex;
          padding: 10px 0;
          align-items: center;
      }
      .popup-row .col.description {
          float: left;
          padding-right: 15px;
      }
      .popup-row .col.action {
          float: right;
          text-align: right;
      }
      .popup-row .div-title {
          color: var(--spice-text);
      }                
      .popup-row .divider {
          height: 2px;
          border-width: 0;
          background-color: var(--spice-button-disabled);
      }
      .popup-row .space {
          margin-bottom: 20px;
          visibility: hidden;
      }
      .popup-row .info {
          /* font-size: 13px; */
      }
      .popup-row .red {
          font-size: 13px;
          color: #59CE8F;
      }
      .popup-row .demo {
          font-size: 13px;
          color: #59CE8F;
      }
      .popup-row .little-space {
          margin-bottom: 10px;
      }
      .popup-row .inputbox {
          padding: 10px;
          border-radius: 15px;
          border: 0;
          box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.06);
      }
      button.checkbox {
          align-items: center;
          color: var(--spice-text);
          cursor: pointer;
          display: flex;
          margin-inline-start: 12px;
      }
      button.checkbox.disabled {
          color: rgba(var(--spice-rgb-text), 0.3);
      }
      select {
          color: var(--spice-text);
          background: rgba(var(--spice-rgb-shadow), 0.7);
          border: 0;
          height: 32px;
      }
      ::-webkit-scrollbar {
          width: 8px;
      }
      .login-button {
          background-color: var(--spice-button);
          border-radius: 8px;
          border-style: none;
          color: var(--spice-text);
          cursor: pointer;
          font-size: 14px;
          height: 40px;
          margin: 10px;
          padding: 5px 10px;
          text-align: center;
      }
      .green {
          background-color: #76ba99;
          color: #25316D;
      }
      .red {
          background-color: #A9555E;
      }
      .small-button.red {
          background-color: #A9555E !important;
      }
      input.small-input {
          padding: 5px !important;
          border-radius: 6px !important;
          right: 0px !important;
          margin: 5px;
      }
      .small-button {
          margin-right: 20px;
      }
      .popup-row .inputbox[type="color"] {
          background-color: var(--spice-custom-main-secondary) !important;
          padding: 0px;
          border-radius: 5px !important;
          border: none;
          margin-right: 10px;
      }
      .popup-row .inputbox[type="color"]::-webkit-color-swatch {
          border-radius: 5px !important;
          border: none;
      }
      .popup-row.search-div .col {
          position: relative;
      }
      .popup-row .nord-search-container {
          width: 100%;
      }
      .popup-row .nord-search-icon {
          position: absolute;
          margin: 10px;
      }
      .popup-row .nord-search {
          padding: 10px 36px !important;
          width: 100%;
      }
      .popup-row .display-none {
          display: none !important;
      }
      .GenericModal[aria-label*="Genres of"] .main-trackCreditsModal-header .tetrax-settings-discord-link {
          color: var(--spice-custom-success);
      }
      .GenericModal[aria-label*="Genres of"] .main-trackCreditsModal-header .tetrax-settings-discord-link:hover {
          color: var(--spice-custom-link-hover);
      }`
  );
  function ButtonItem({ name = "", color = "", onclickFun = () => {
  } }) {
    return React.createElement("button", {
      className: `login-button${color}`,
      onClick: () => onclickFun()
    }, name);
  }
  function GenreItem() {
    const [value, setValue] = React.useState(allGenresForPopupModal);
    Spicetify.Player.addEventListener("songchange", () => {
      setTimeout(() => setValue(allGenresForPopupModal), 500);
    });
    return value.map((name) => {
      return React.createElement(ButtonItem, {
        name: name.replace(/(^\w{1})|([\s-]+\w{1})/g, (letter) => letter.toUpperCase()),
        onclickFun: async () => {
          const playlist = await fetchSoundOfSpotifyPlaylist(name);
          if (playlist.uri === null || playlist.uri.includes("|||")) {
            Spicetify.Platform.History.push(`/search/${name}/playlists`);
          } else {
            Spicetify.Platform.History.push(`/playlist/${playlist.uri.split(":")[2]}`);
          }
          Spicetify.PopupModal.hide();
        }
      });
    });
  }
  async function updateLastFmTags() {
    const { artist_name: artistName, title: trackName } = Spicetify.Player.data.item.metadata;
    lastFmTags = [];
    const response = await fetchDataFromLastFM(artistName, trackName);
    if (!response)
      return;
    const tags = response.track.toptags.tag;
    if (!tags)
      return;
    for (const tag of tags) {
      if (!/\d/.test(tag.name)) {
        lastFmTags.push(tag.name);
      }
    }
  }
  function lastFmTagItem() {
    if (lastFmTags.length === 0) {
      return React.createElement("div", null, null);
    }
    const [value, setValue] = React.useState(lastFmTags);
    Spicetify.Player.addEventListener("songchange", () => {
      setTimeout(() => setValue(lastFmTags), 500);
    });
    return React.createElement(
      "div",
      null,
      React.createElement("div", { className: "popup-row" }, React.createElement("hr", { className: "space" }, null)),
      React.createElement("div", { className: "popup-row" }, React.createElement("h1", { className: "div-title" }, "Last FM Tags")),
      value.map((name) => {
        return React.createElement(ButtonItem, {
          name: name.replace(/(^\w{1})|([\s-]+\w{1})/g, (letter) => letter.toUpperCase()),
          onclickFun: async () => {
            Spicetify.Platform.History.push(`/search/${name}/playlists`);
            Spicetify.PopupModal.hide();
          }
        });
      })
    );
  }
  const settingsDOMContent = React.createElement(
    "div",
    null,
    settingsMenuCSS,
    React.createElement("p", { className: "popup-row" }, 'Tip: You can right click on genres in the "Player Bar" to open this popup.'),
    React.createElement("div", { className: "popup-row" }, React.createElement("hr", { className: "space" }, null)),
    React.createElement(GenreItem, null, null),
    React.createElement(lastFmTagItem, null, null)
  );
  function genrePopup() {
    Spicetify.PopupModal.display({
      title: `Genres of "` + Spicetify.Player.data.item.metadata.title.replace(/\(.+?\)/g, "").replace(/\[.+?\]/g, "").replace(/\s\-\s.+?$/, "").replace(/,.+?$/, "").trim() + `"`,
      content: settingsDOMContent,
      isLarge: true
    });
  }
  let infoContainer = null;
  let genreContainer = null;
  (function initMain() {
    if (!Spicetify.Player.data) {
      setTimeout(initMain, 1e3);
      return;
    }
    main();
  })();
  async function removeGenresFromUI() {
    infoContainer = await waitForElement("div.main-trackInfo-container", 1e3);
    try {
      if (!infoContainer || !genreContainer)
        return;
      infoContainer.removeChild(genreContainer);
    } catch {
    }
  }
  async function updateGenres() {
    if (!CONFIG.state || Spicetify.Player.data.item.metadata.is_local || Spicetify.URI.fromString(Spicetify.Player.data.item.uri).type !== "track") {
      removeGenresFromUI();
      return;
    }
    injectGenre();
    updateLastFmTags();
  }
  function artistPageGenreOnClick(dataValue) {
    Spicetify.Platform.History.push(`/search/${dataValue}/playlists`);
  }
  async function makeDOMForArtistPage(allGenres) {
    if (!allGenres)
      return;
    const allGenreElementsPromises = allGenres.map(async (genre) => {
      const playlist = await fetchSoundOfSpotifyPlaylist(genre);
      if (playlist.uri !== null) {
        return [
          [
            `<a class="main-entityHeader-genreLink" href="${playlist.uri.includes("|||") ? `#" data-value="${genre}" onclick="artistPageGenreOnClick(this.getAttribute('data-value'))" ` : playlist.uri + '"'} style="color: var(--spice-subtext); font-size: 1rem">${genre.replace(/(^\w{1})|([\s-]+\w{1})/g, (letter) => letter.toUpperCase())}</a>`
          ],
          [`<span>, </span>`]
        ];
      }
    });
    const allGenreElementsCombined = await Promise.all(allGenreElementsPromises);
    let allGenreElements = allGenreElementsCombined.flat(Infinity);
    if (allGenreElements[allGenreElements.length - 1] == "<span>, </span>") {
      allGenreElements.pop();
    }
    allGenreElements.unshift("<span>Artist Genres : </span>");
    const allGenreElementsHTML = allGenreElements.join("");
    let genreContainer2 = document.createElement("div");
    genreContainer2.className = "main-entityHeader-detailsText genre-container";
    genreContainer2.innerHTML = allGenreElementsHTML;
    try {
      document.querySelector(".genre-container")?.remove();
    } catch {
    }
    let infoContainer2 = await waitForElement("div.main-entityHeader-headerText", 1e3);
    let monthlyListeners = await waitForElement("span.main-entityHeader-detailsText", 1e3);
    infoContainer2?.insertBefore(genreContainer2, monthlyListeners);
  }
  async function updateArtistPage(pathname) {
    let pathData = pathname.split("/");
    if (!(pathData[1] == "artist" && pathData.length == 3))
      return;
    let artistGenres = await getAllArtistsGenres(["spotify:artist:" + pathData[2]], "artist");
    makeDOMForArtistPage(artistGenres);
  }
  async function main() {
    infoContainer = await waitForElement("div.main-trackInfo-container", 1e3);
    genreContainer = document.createElement("div");
    genreContainer.className = "main-trackInfo-genres ellipsis-one-line main-type-finale";
    genreContainer.addEventListener("contextmenu", genrePopup);
    await updateGenres();
    Spicetify.Player.addEventListener("songchange", updateGenres);
    await updateArtistPage(Spicetify.Platform.History.location.pathname);
    Spicetify.Platform.History.listen((data) => {
      updateArtistPage(data.pathname);
    });
    if (Spicetify.Playbar?.Widget) {
      new Spicetify.Playbar.Widget(
        CONFIG.state ? "Hide Spotify Genres" : "Show Spotify Genres",
        CONFIG.state ? iconActive : icon,
        (element) => {
          if (CONFIG.state) {
            element.icon = icon;
            element.label = "Show Spotify Genres";
            CONFIG.state = false;
          } else {
            element.icon = iconActive;
            element.label = "Hide Spotify Genres";
            CONFIG.state = true;
          }
          saveConfig("state", CONFIG.state);
          updateGenres();
        },
        false
      );
    }
  }
})();

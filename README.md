# Spotify Genres

See what genres you are listening to with this [Spicetify](https://spicetify.app/) extension.

## Previews

### See in a pop-up

Right click on a genre in the player bar.

![Pop-up](https://raw.githubusercontent.com/Vexcited/better-spotify-genres/main/.github/popup.png)

### Toggle

You can easily toggle the widget by clicking on the icon in the player bar.

![Widget](https://raw.githubusercontent.com/Vexcited/better-spotify-genres/main/.github/widget-demo.gif)

## Install Manually

Copy [`spotifyGenres.js`](https://raw.githubusercontent.com/Vexcited/better-spotify-genres/build/spotifyGenres.js) from the `build` branch into your [Spicetify](https://github.com/spicetify/spicetify-cli) extensions directory:

| **Platform** | **Path**                                                                             |
| ------------ | ------------------------------------------------------------------------------------ |
| **Linux**    | `~/.config/spicetify/Extensions` or `$XDG_CONFIG_HOME/.config/spicetify/Extensions/` |
| **MacOS**    | `~/spicetify_data/Extensions` or `$SPICETIFY_CONFIG/Extensions`                      |
| **Windows**  | `%appdata%\spicetify\Extensions`                                                     |

After putting the extension file into the correct folder, run the following command to install the extension:

```bash
spicetify config extensions spotifyGenres.js
spicetify apply
```

## Credits

Forked from [Tetrax-10's Spotify-Genres](https://github.com/Tetrax-10/Spicetify-Extensions).

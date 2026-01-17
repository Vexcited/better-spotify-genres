# Spotify Genres

See what genres you are listening to with this [Spicetify](https://spicetify.app/) extension.

## Previews

Genres will be displayed below the author in current track information.

<img width="394" height="90" alt="image" src="https://github.com/user-attachments/assets/5c23ba9e-8e92-4b3b-9e0f-71a37501589e" />

If available, clicking on a genre will bring the Spotify-made playlist with related tracks of this specific genre.

<img width="1647" height="939" alt="image" src="https://github.com/user-attachments/assets/b048c96f-8929-4af2-83fe-8e84b0b3b4d3" />

## Install Manually

Copy [`spotifyGenres.js`](https://raw.githubusercontent.com/Vexcited/better-spotify-genres/build/spotifyGenres.js) from the `build` branch into your [Spicetify](https://github.com/spicetify/spicetify-cli) extensions directory:

| **Platform** | **Path**                         |
| ------------ | -------------------------------- |
| **Linux**    | `~/.config/spicetify/Extensions` |
| **MacOS**    | `~/.config/spicetify/Extensions` |
| **Windows**  | `%appdata%\spicetify\Extensions` |

After putting the extension file into the correct folder, run the following command to install the extension:

```bash
spicetify config extensions spotifyGenres.js
spicetify apply
```

## Install from Marketplace

You can install this extension from the Spicetify Marketplace, just search for "Better Spotify Genres" and click install.

## Development

## Credits

Forked from [Tetrax-10's Spotify-Genres](https://github.com/Tetrax-10/Spicetify-Extensions).

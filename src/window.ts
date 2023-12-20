export interface CustomWindow extends Window {
  genrePopup: () => void
  artistPageGenreOnClick: (dataValue: string) => void
}
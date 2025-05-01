export interface CustomWindow extends Window {
  genrePopup: () => void
  artistPageGenreOnClick: (dataValue: string) => void
  _onGenreItemMouseOver: (element: HTMLAnchorElement) => void
  _onGenreItemMouseOut: (element: HTMLAnchorElement) => void
}

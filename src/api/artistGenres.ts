export interface SpotifyArtistResponse {
  external_urls: {
    spotify: string
  }

  followers: {
    href: string | null
    total: number
  }

  genres: Array<string>
  href: string
  id: string

  images: Array<{
    url: string
    height: number | null
    width: number | null
  }>
}

export async function fetchArtistGenres(artistURI: string): Promise<string[]> {
  const response: SpotifyArtistResponse = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/artists/${artistURI}`);
  return response.genres;
}

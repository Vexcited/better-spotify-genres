const LFMApiKey = "44654ea047786d90338c17331a5f5d95"

export interface LastFMTrackResponse {
  track: {
    name: string
    url: string
    duration: string
    streamable: {
      "#text": string
      fulltrack: string
    }

    listeners: string
    playcount: string

    artist: {
      name: string
      mbid?: string
      url: string
    }

    toptags: {
      tag: Array<{
        name: string
        url: string
      }>
    }
  }
}

export interface LastFMTrackError {
  error: number
  links: unknown[]
  message: string
}

/**
 * Fetch data from Last.FM
 */
export async function fetchDataFromLastFM(artistName: string, trackName: string): Promise<LastFMTrackResponse | null> {
  const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LFMApiKey}&artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(trackName)}&format=json`

  try {
    const response = await fetch(url);
    const data = await response.json() as LastFMTrackResponse | LastFMTrackError;

    // Track is not found in Last.FM
    if ("error" in data) {
      return null;
    }
    
    return data;
  }
  // Might be a network error.
  catch {
    return null;
  }
}

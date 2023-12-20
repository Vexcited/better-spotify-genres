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

/**
 * Fetch data from Last.FM
 */
export async function fetchDataFromLastFM(artistName: string, trackName: string): Promise<LastFMTrackResponse | null> {
  const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LFMApiKey}&artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(trackName)}&format=json`

  try {
    const response = await fetch(url)
    const data = await response.json()
    
    return data;
  }
  catch (error) {
    // TODO: Add a toast for this error.
    console.error(error);
    return null;
  }
}

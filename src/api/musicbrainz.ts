export async function fetchTagsFromMusicBrainz(
  artistName: string,
  trackName: string,
): Promise<Array<string>> {
  let url = new URL("https://musicbrainz.org/ws/2/recording?fmt=json&limit=1");
  url.searchParams.set(
    "query",
    `recording:"${trackName} AND artist:"${artistName}"`,
  );

  const results = await fetch(url).then((res) => res.json());
  if (!results.recordings?.[0]) return [];

  url = new URL(
    `https://musicbrainz.org/ws/2/recording/${results.recordings[0].id}?inc=tags+artists&fmt=json`,
  );
  const recording = await fetch(url).then((res) => res.json());

  if (recording.tags.length === 0) {
    return recording["artist-credit"][0].artist.tags.map(
      (tag: any) => tag.name,
    );
  }

  return recording.tags.map((tag: any) => tag.name);
}

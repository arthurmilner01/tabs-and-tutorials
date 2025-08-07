const backendUrl = "http://localhost:8000";

export async function searchForArtists(artist) {
    const res = await fetch(`${backendUrl}/spotify/search_artists?artist=${encodeURIComponent(artist)}`);
    if (!res.ok) throw new Error("Failed to fetch artists.");
    return res.json();
}

export async function searchForSongs(song) {
    const res = await fetch(`${backendUrl}/spotify/search_songs?song=${encodeURIComponent(song)}`);
    if (!res.ok) throw new Error("Failed to fetch songs.");
    return res.json();
}
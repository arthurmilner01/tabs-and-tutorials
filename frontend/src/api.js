const backendUrl = "http://localhost:8000";

// Spotify related API calls
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

export async function getArtistByID(artistID) {
    const res = await fetch(`${backendUrl}/spotify/artists/${encodeURIComponent(artistID)}`);
    if (!res.ok) throw new Error("Failed to fetch artist details.");
    return res.json();
}

export async function getSongByID(songID) {
    const res = await fetch(`${backendUrl}/spotify/songs/${encodeURIComponent(songID)}`)
    if (!res.ok) throw new Error("Failed to fetch song details.");
    return res.json();
}

export async function getArtistSongsByID(artistID){
    const res = await fetch(`${backendUrl}/spotify/artists/${encodeURIComponent(artistID)}/songs`);
    if (!res.ok) throw new Error("Failed to fetch artist songs.");
    return res.json();
}

export async function searchForArtistsSongs(artistName, songName) {
    const res = await fetch(`${backendUrl}/spotify/artists/${encodeURIComponent(artistName)}/search_songs?song=${encodeURIComponent(songName)}`)
    if (!res.ok) throw new Error("Failed to fetch artist's songs.");
    return res.json();
}

// Youtube related API calls
export async function searchTutorialVideos(searchQuery) {
    const res = await fetch(`${backendUrl}/youtube/get_video_tutorials/${encodeURIComponent(searchQuery)}`)
    if (!res.ok) throw new Error("Failed to fetch youtube video tutorials.");
    return res.json();
}
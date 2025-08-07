import { useState } from 'react'
import './App.css'
import { searchForArtists, searchForSongs } from './api'

function App() {

  const [query, setQuery] = useState(""); // State to hold the search query
  const [results, setResults] = useState(null); // State to hold the search results
  const [searchError, setSearchError] = useState(null); // State to hold any search errors
  const [isLoading, setIsLoading] = useState(false); // State to indicate if the search is in progress

  const handleSearch = async () => {
    try {
      // Set loading and clear previous results
      setIsLoading(true);
      setSearchError(null);
      setResults(null);
      // Calling the API to search for artists and songs
      const artistData = await searchForArtists(query);
      const songsData = await searchForSongs(query);
      // Combining songs and artists
      const searchData = {
        artists: artistData,
        songs: songsData,
      };
      // Setting the results to display the song and artist information
      setResults(searchData);
      // Clear any previous search errors
      setSearchError(null);
    } catch (err) {
      // If error display and clear results
      setSearchError(err.message);
      setResults(null);
    } finally {
      // Set loading to false after the search is complete
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Tabs & Tutorials</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter song/artist name"
      />
      <button onClick={handleSearch}
      disabled={isLoading}>
        Search
      </button>

      {searchError && <p style={{ color: "red" }}>{searchError}</p>}

      <h1>Search Results</h1>

      {isLoading && <p>Loading...</p>}

      {/* If results are available and not loading, display the results, otherwise hides the content */}
      {!isLoading && results && (
        <>

        {/* Display the returned songs from search query, if no songs found display no songs found */}
        <h1>Songs</h1>
        {results?.songs?.results?.trackmatches?.track?.length > 0 ? (
          <ul>
            {/* For each song map song details and song's artist */}
            {results.songs.results.trackmatches.track.map((song) => (
              <li key={song.mbid || song.name}>
                <a href={song.url} target="_blank" rel="noreferrer">
                  {song.name} - {song.artist}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          results && <p>No songs found.</p>
        )}

        {/* Display the returned artists from search query, if no artists found display no artists found */}
        <h1>Artists</h1>
        {results?.artists?.results?.artistmatches?.artist?.length > 0 ? (
          <ul>
            {/* For each artist map artist details */}
            {results.artists.results.artistmatches.artist.map((artist) => (
              <li key={artist.mbid || artist.name}>
                <a href={artist.url} target="_blank" rel="noreferrer">
                  {artist.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          results && <p>No artists found.</p>
        )}
        
        </>
      )}
    </div>
  );
}

export default App

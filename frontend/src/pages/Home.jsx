import { useState } from 'react'
import { searchForArtists, searchForSongs } from '../api'
import { Search } from 'lucide-react';
import SongCard from '../components/SongCard.jsx'
import ArtistCard from '../components/ArtistCard.jsx';

function Home() {

  const [query, setQuery] = useState(""); // State to hold the search query
  const [results, setResults] = useState(null); // State to hold the search results
  const [searchError, setSearchError] = useState(null); // State to hold any search errors
  const [isLoading, setIsLoading] = useState(false); // State to indicate if the search is in progress
  const [filter, setFilter] = useState(""); // State to hold the search filter

  const clearSearch = () => {
    setQuery("");
    setResults(null);
    setSearchError(null);
    setIsLoading(false);
    setFilter("");
  };

  const handleSearch = async () => {
    if (!query.trim()) {
    setSearchError("Search cannot be blank.");
    setResults(null);
    return;
    }

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
        <div className="flex flex-col items-center justify-center gap-8 mb-20 mt-40">
          <div className="flex flex-row items-center justify-center gap-4 w-full">
            <input
            className="border border-purple-300 
            rounded px-8 py-4 md:w-4/5 w-3/5 max-w-3xl
            text-dark"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
              handleSearch();
              }
            }}
            placeholder="Enter song/artist name..."
            />

            <select
            className="border border-purple-300 
            rounded px-8 py-4 md:w-1/5 w-2/5 max-w-3xl
            text-dark"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            >
                <option value="">All</option>
                <option value="songs">Songs</option>
                <option value="artists">Artists</option>
            </select>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-4 w-full">
            <button 
            className="bg-purple-700 text-white 
            px-8 py-4 rounded-xl
            text-lg hover:bg-purple-800
            flex items-center gap-2"
            onClick={handleSearch}
            disabled={isLoading}>
                <Search size={20}/> Search
            </button>
            <button 
            className="text-white
            text-lg text-muted-500 
            hover:text-purple-700"
            onClick={clearSearch}
            >
                Clear Search
            </button>
          </div>

            {searchError && <p className="text-red-500 text-center">{searchError}</p>}

            {isLoading && 
            <div className="flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-dashed rounded-full animate-spin"></div>
            </div>
            }
        </div>

    <div className="flex flex-col md:flex-row items-start justify-center gap-4">
        {/* If results are available and not loading, display the results, otherwise hides the content */}
        {!isLoading && results && (
            <>
            {/* If filter is empty or set to songs, display songs section */}
            {(filter === "" || filter === "songs") && (
            <div className="flex flex-col items-center w-full">
            {/* Display the returned songs from search query, if no songs found display no songs found */}
                <h1 className="text-white text-2xl font-bold mb-10">
                    Songs
                </h1>
                {results?.songs?.tracks?.items?.length > 0 ? (
                <ul>
                    {/* For each song map song details and song's artist */}
                    {results.songs.tracks.items.map((song) => (
                    <li key={song.id}>
                        <SongCard song={song} />
                    </li>
                    ))}
                </ul>
                ) : (
                results && <p className="text-white">No songs found.</p>
                )}
            </div>
            )}

            {/* If filter is empty or set to artists, display artists section */}
            {(filter === "" || filter === "artists") && (
            <div className="flex flex-col items-center w-full">
            {/* Display the returned artists from search query, if no artists found display no artists found */}
            <h1 className="text-white text-2xl font-bold mb-10">
                Artists
            </h1>
            {results?.artists?.artists?.items?.length > 0 ? (
            <ul>
                {/* For each artist map artist details */}
                {results.artists.artists.items.map((artist) => (
                <li key={artist.id}>
                    <ArtistCard artist={artist} />
                </li>
                ))}
            </ul>
            ) : (
            results && <p className="text-white">No artists found.</p>
            )}
            </div>
            )}
            </>
        )}
        </div>
    </div>
  );
}

export default Home

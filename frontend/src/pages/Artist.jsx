import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getArtistByID, getArtistSongsByID, searchForArtistsSongs } from '../api';
import placeholderImage from '../assets/placeholder.jpg';
import SongCard from '../components/SongCard';

function Artist() {
    const { artistID } = useParams();
    const [artist, setArtist] = useState(null); // State to hold the artist details
    const [isArtistLoading, setIsArtistLoading] = useState(true); // State to indicate loading status regaring artist details
    const [artistError, setArtistError] = useState(null); // State to hold errors regarding artist details
    const [artistImageUrl, setArtistImageUrl] = useState('');

    const [artistSongs, setArtistSongs] = useState(null); // State to hold artist's songs
    const [isSongsLoading, setIsSongsLoading] = useState(true); // State to indicate loading status regarding artist's songs
    const [songsError, setSongsError] = useState(null); // State to hold errors regarding artist's songs

    const [songSearchQuery, setSongSearchQuery] = useState(""); // State to hold the song search query
    const [songSearchResults, setSongSearchResults] = useState(null); // State to hold the song search results
    const [songSearchError, setSongSearchError] = useState(null); // State to hold any song search errors
    const [isSongSearchLoading, setIsSongSearchLoading] = useState(false); // State to indicate if the song search is in progress


    useEffect(() => {
        // Fetch artist details from Spotify API using the artistID from the URL
        async function fetchArtist() {
            try {
                const artistData = await getArtistByID(artistID);
                setArtist(artistData);
                setArtistImageUrl(artistData.images && artistData.images.length > 0 ? artistData.images[0].url : placeholderImage);
            } catch (err) {
                setArtistError(err.message);
            } finally {
                setIsArtistLoading(false);
            }
        }

        async function fetchArtistSongs() {
            try {
                const songsData = await getArtistSongsByID(artistID);
                setArtistSongs(songsData);
            } catch (err) {
                setSongsError(err.message);
            } finally {
                setIsSongsLoading(false);
            }
        }
        fetchArtist();
        fetchArtistSongs();
    }, [artistID]);

    useEffect(() => {
        // Fetch artist's songs based on the search query after a short delay form the last input
        const searchDelay = setTimeout(() => {
            handleSongSearch();
        }, 500);

        // Resets delay if input is changed before it expires
        return () => clearTimeout(searchDelay);
        
    }, [songSearchQuery]); // Depending on songSearchQuery to trigger the search


    const handleSongSearch = async () => {
        if (!songSearchQuery.trim()) {
            setSongSearchError("Search cannot be blank.");
            setSongSearchResults(null);
            return;
        }
    
        try {
            // Set loading and clear previous results
            setIsSongSearchLoading(true);
            setSongSearchError(null);
            setSongSearchResults(null);
            // Calling the API to search for the artist's songs
            const songSearchData = await searchForArtistsSongs(artist.name, songSearchQuery);
            setSongSearchResults(songSearchData);
            // Clear any previous search errors
            setSongSearchError(null);
        } catch (err) {
            // If error display and clear results
            setSongSearchError(err.message);
            setSongSearchResults(null);
        } finally {
            // Set loading to false after the search is complete
            setIsSongSearchLoading(false);
        }
    };

    return (
    <div className="flex flex-col items-center 
    justify-center gap-8 mb-20
    text-white">
        {isArtistLoading &&
            <div className="flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-dashed rounded-full animate-spin"></div>
            </div>
        }

        {artistError && <p className="text-red-500 text-center">{artistError}</p>}

        {/* If artist data is loaded, display the artist details */}
        {!isArtistLoading && !artistError && artist && (
        <>
            <div className="relative w-full min-h-[500px] max-h-[500px] overflow-hidden
            flex items-center justify-center">
                {/* Artist image as banner background, only display if real image found */}
                {artistImageUrl !== placeholderImage && (
                    <img
                    src={artistImageUrl}
                    alt="Background image of the artist"
                    className="absolute inset-0 w-full 
                    h-full object-cover opacity-30 z-0"
                    />
                )}

                <div className="absolute inset-0 bg-black opacity-40 z-10" />

                <div className="relative z-20 flex flex-col 
                md:flex-row items-center text-center 
                md:text-start gap-4 md:gap-12">
                <img
                src={artistImageUrl}
                alt={artist.name}
                width={250}
                height={250}
                className="rounded-xl"
                />
                <div className="flex flex-col gap-4">
                    {/* Display artist details, checking they exist before rendering */}
                    {artist.name ?
                        <h1 className="text-lg md:text-2xl 
                        font-bold mb-4
                        max-w-md">
                            {artist.name.toUpperCase()}
                        </h1>
                        :
                        <h1 className="text-lg md:text-2xl 
                        font-bold mb-4
                        max-w-md">
                            NOT FOUND
                        </h1>
                    }

                    {artist.genres && artist.genres.length > 0 ?
                        <p>GENRES: {artist.genres?.join(', ').toUpperCase()}</p>
                        :
                        <p>GENRES: N/A</p>
                    }
                    
                    {artist.popularity ?
                        <p>POPULARITY: {artist.popularity}</p>
                        :
                        <p>POPULARITY: N/A</p>
                    }

                    {artist.followers && artist.followers.total ?
                        <p>FOLLOWERS: {artist.followers.total.toLocaleString()}</p>
                        :
                        <p>FOLLOWERS: N/A</p>
                    }
                </div>
                </div>
            </div>
        </>
        )}

        <h1 className="text-2xl font-bold mb-4">
                Artist's Songs
        </h1>

        <input
        className="border border-purple-300 
        rounded px-8 py-4 md:w-4/5 w-3/5 max-w-3xl
        text-black"
        value={songSearchQuery}
        onChange={(e) => setSongSearchQuery(e.target.value)}
        onKeyDown={(e) => {
            if (e.key === 'Enter') {
            handleSongSearch();
            }
        }}
        placeholder="Enter artist's song name..."
        />

        {songsError && <p className="text-red-500 text-center">{songsError}</p>}

        {isSongsLoading &&
            <div className="flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-dashed rounded-full animate-spin"></div>
            </div>
        }

        {/* If artist's songs data is loaded, display the songs */}
        {/* If song search query isn't null do not display the top tracks */}
        {!isSongsLoading && !songsError && artistSongs && !songSearchQuery &&(
            artistSongs?.tracks?.length > 0 ? (
                <ul>
                    {/* For each song map song details and song's artist */}
                    {artistSongs.tracks.map((song) => (
                    <li key={song.id}>
                        <SongCard song={song} />
                    </li>
                    ))}
                </ul>
                ) : (
                artistSongs && <p className="text-white">No songs found.</p>
            )
        )}

        {/* If song search results are available, display them */}
        {!isSongSearchLoading && !songSearchError && songSearchResults && (
            songSearchResults?.tracks?.items?.length > 0 ? (
                <ul>
                    {/* For each song, map song details and song's artist */}
                    {songSearchResults.tracks.items.map((song) => (
                    <li key={song.id}>
                        <SongCard song={song} />
                    </li>
                    ))}
                </ul>
                ) : (
                songSearchResults && <p className="text-white">Search returned no songs.</p>
            )
        )}

    </div>
    );
}

export default Artist

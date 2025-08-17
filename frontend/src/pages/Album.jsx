import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAlbumByID } from '../api';
import placeholderImage from '../assets/albumplaceholder.png';
import spotifyIcon from '../assets/spotify-icon.png';

function Album() {
    const { albumID } = useParams();
    const [album, setAlbum] = useState(null); // State to hold album details
    const [isAlbumLoading, setIsAlbumLoading] = useState(true); // State to indicate loading status regarding album details
    const [albumError, setAlbumError] = useState(null); // State to hold errors regarding album details
    const [albumImageUrl, setAlbumImageUrl] = useState('');


    useEffect(() => {
        // Fetch album details from Spotify API using the albumID from the URL
        async function fetchAlbum() {
            try {
                const albumData = await getAlbumByID(albumID);
                setAlbum(albumData);
                setAlbumImageUrl(albumData.images && albumData.images.length > 0 ? albumData.images[0].url : placeholderImage);
            } catch (err) {
                setAlbumError(err.message);
            } finally {
                setIsAlbumLoading(false);
            }
        }

        fetchAlbum();
    }, [albumID]);

    // Converts the spotify ms duration to minutes and seconds
    function formatDuration(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const paddedSeconds = seconds.toString().padStart(2, '0');
        return `${minutes}:${paddedSeconds}`;
    }

    return (
    <div className="flex flex-col items-center 
    justify-center gap-8 mb-20
    text-white">
        {isAlbumLoading &&
            <div className="flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-dashed rounded-full animate-spin"></div>
            </div>
        }

        {albumError && <p className="text-red-500 text-center">{albumError}</p>}

        {/* If artist data is loaded, display the artist details */}
        {!isAlbumLoading && !albumError && album && (
        <>
        <div className="relative w-full min-h-[500px] max-h-[500px] overflow-hidden
        flex items-center justify-center">
            {/* Artist image as banner background, only display if real image found */}
            {albumImageUrl !== placeholderImage && (
                <img
                src={albumImageUrl}
                alt="Background image of the album art"
                className="absolute inset-0 w-full 
                h-full object-cover opacity-30 z-0"
                />
            )}

            <div className="absolute inset-0 bg-black opacity-40 z-10" />

            <div className="relative z-20 flex flex-col 
            md:flex-row items-center text-center 
            md:text-start gap-4 md:gap-12">
                <img
                src={albumImageUrl}
                alt={album.name}
                width={250}
                height={250}
                className="rounded-xl"
                />
                <div className="flex flex-col gap-4">
                    {/* Display album details, checking they exist before rendering */}
                    {album.name ?
                        <h1 className="text-lg md:text-2xl 
                        font-bold mb-4
                        max-w-md">
                            {album.name}
                        </h1>
                        :
                        <h1 className="text-lg md:text-2xl 
                        font-bold mb-4
                        max-w-md">
                            NOT FOUND
                        </h1>
                    }

                    {album.artists[0].name ?
                        <h1 className="text-md md:text-xl 
                        text-white mb-4">
                            Album by <Link to={`/artist/${album.artists[0].id}`} className="italic hover:underline">
                                {album.artists[0].name}
                            </Link>
                        </h1>
                        :
                        <h1 className="text-md md:text-xl 
                        text-gray-400 mb-4">
                            NOT FOUND
                        </h1>
                    }

                    {album.release_date ?
                        <h1 className="text-md md:text-lg 
                        text-gray-400">
                            Release Date: {album.release_date}
                        </h1>
                        :
                        <h1 className="text-md md:text-lg 
                        text-gray-400">
                            NOT FOUND
                        </h1>
                    }

                    {album.total_tracks ?
                        <h1 className="text-md md:text-lg 
                        text-gray-400">
                            Total Tracks: {album.total_tracks}
                        </h1>
                        :
                        <h1 className="text-md md:text-lg 
                        text-gray-400">
                            NOT FOUND
                        </h1>
                    }

                    {album.external_urls?.spotify && (
                        <a
                            href={album.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:underline"
                        >
                            <img src={spotifyIcon} alt="Spotify logo" className="w-5 h-5" />
                            Listen on Spotify
                        </a>
                    )}
                </div>
            </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">
            Album's Songs
        </h1>
        
        {/* Check album songs have loaded, and display them in a table */}
        {album.tracks?.items && album.tracks.items.length > 0 ? (
            <div className="overflow-x-auto w-full md:w-5/6 p-5">
                <table className="table-auto w-full text-left text-white
                bg-white/10 backdrop-blur-sm border border-white/20
                border border-purple-800">
                    <thead>
                        <tr className="border-b border-purple-800">
                            <th className="w-1/6 px-4 py-2">#</th>
                            <th className="w-4/6 px-4 py-2">Title</th>
                            <th className="w-1/6 px-4 py-2">Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {album.tracks.items.map((track) => (
                            <tr key={track.id} className="hover:bg-purple-800">
                                <td className="px-4 py-2">{track.track_number}</td>
                                <td className="px-4 py-2">
                                    <Link to={`/song/${track.id}`} className="italic hover:underline">
                                        {track.name}
                                    </Link>
                                </td>
                                <td className="px-4 py-2">{formatDuration(track.duration_ms)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p className="text-gray-400 mt-4">No tracks found for this album.</p>
        )}
        </>
    )}
    </div>
);
}

export default Album

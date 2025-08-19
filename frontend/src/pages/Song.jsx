import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSongByID, searchTabWebsites, searchTutorialVideos } from '../api';
import placeholderImage from '../assets/albumplaceholder.png';
import spotifyIcon from '../assets/spotify-icon.png';
import TutorialCard from '../components/TutorialCard';
import TabResult from '../components/TabResult';

function Song() {
    const { songID } = useParams();
    const [song, setSong] = useState(null); // State to hold the song details
    const [isSongLoading, setIsSongLoading] = useState(true); // State to indicate loading status regaring song details
    const [songError, setSongError] = useState(null); // State to hold errors regarding song details
    const [songImageUrl, setSongImageUrl] = useState('');

    const [tutorials, setTutorials] = useState(null); // State to hold the youtube tutorial information
    const [isTutorialsLoading, setIsTutorialsLoading] = useState(true); // State to indicate loading status regaring tutorial details
    const [tutorialsError, setTutorialsError] = useState(null); // State to hold errors regarding youtube tutorials

    const [tabs, setTabs] = useState(null); // State to hold the tab search information
    const [isTabsLoading, setIsTabsLoading] = useState(true); // State to indicate loading status regaring tabs
    const [tabsError, setTabsError] = useState(null); // State to hold errors regarding tab search

    useEffect(() => {
        // Fetch song details from Spotify API using the songID from the URL
        async function fetchSong() {
            try {
                const songData = await getSongByID(songID);
                setSong(songData);
                setSongImageUrl(songData.album.images && songData.album.images.length > 0 ? songData.album.images[0].url : placeholderImage);
            } catch (err) {
                setSongError(err.message);
            } finally {
                setIsSongLoading(false);
            }
        }

        fetchSong();
    }, [songID]);

    // When/if song loads search for Youtube tutorials
    useEffect(() => {
        if (!song?.name || !song?.artists[0].name) return; // Only fetch if song has returned a name

        async function fetchTabs() {
            setIsTabsLoading(true);
            try {
                const tabs = await searchTabWebsites(`${song.name} ${song.artists[0].name}`);
                setTabs(tabs.items);
            } catch (err) {
                setTabsError(err.message);
            } finally {
                setIsTabsLoading(false);
            }
        }

        async function fetchTutorials() {
            setIsTutorialsLoading(true);
            try {
                const videos = await searchTutorialVideos(`${song.name} ${song.artists[0].name}`);
                setTutorials(videos.items);
            } catch (err) {
                setTutorialsError(err.message);
            } finally {
                setIsTutorialsLoading(false);
            }
        }

        fetchTabs();
        fetchTutorials();
    }, [song]);

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
        {isSongLoading &&
            <div className="flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-dashed rounded-full animate-spin"></div>
            </div>
        }

        {songError && <p className="text-red-500 text-center">{songError}</p>}

        {/* If song data is loaded, display the song details */}
        {!isSongLoading && !songError && song && (
        <>
        <div className="relative w-full min-h-[500px] 
        max-h-[500px] overflow-hidden
        flex items-center justify-center">
            {/* Song image as banner background, only display if real image found */}
            {songImageUrl !== placeholderImage && (
                <img
                src={songImageUrl}
                alt="Background image of the song art"
                className="absolute inset-0 w-full 
                h-full object-cover opacity-30 z-0"
                />
            )}

            <div className="absolute inset-0 bg-black opacity-40 z-10" />
            <div className="relative z-20 flex flex-col 
            md:flex-row items-center text-center 
            md:text-start gap-4 md:gap-12">
                <img
                src={songImageUrl}
                alt={song.name}
                width={250}
                height={250}
                className="rounded-xl"
                />

                <div className="flex flex-col">
                    {/* Display song details, checking they exist before rendering */}
                    {song.name ?
                        <h1 className="text-lg md:text-2xl 
                        font-bold mb-4
                        max-w-md">
                            {song.name}
                            {song.duration_ms && 
                            <p className="text-sm md:text-lg 
                            text-gray-400 mb-4
                            max-w-md">
                                ({formatDuration(song.duration_ms)})
                            </p>}
                        </h1>
                        :
                        <h1 className="text-lg md:text-2xl 
                        font-bold mb-4
                        max-w-md">
                            NOT FOUND
                        </h1>
                    }

                    {song.album.name ?
                        <h1 className="text-md md:text-xl 
                        mb-4">
                            From <Link to={`/album/${song.album.id}`} className="italic hover:underline">
                                {song.album.name}
                            </Link>
                        </h1>
                        :
                        <h1 className="text-lg md:text-2xl 
                        text-gray-400 mb-4">
                            NOT FOUND
                        </h1>
                    }

                    {song.artists[0].name ?
                        <h1 className="text-md md:text-xl 
                        text-gray-400 mb-4">
                            By <Link to={`/artist/${song.artists[0].id}`} className="italic hover:underline">
                                {song.artists[0].name}
                            </Link>
                        </h1>
                        :
                        <h1 className="text-lg md:text-2xl 
                        text-gray-400 mb-4
                        max-w-md">
                            NOT FOUND
                        </h1>
                    }

                    {song.external_urls?.spotify && (
                        <a
                            href={song.external_urls.spotify}
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
        </>
        )}

        <h1 className="text-2xl font-bold text-center">
            Guitar Tabs
        </h1>

        <p className="text-muted italic mb-4 text-center text-gray-400">
            Please note tabs returned may not always be accurate.
        </p>

        {tabsError && <p className="text-red-500 text-center">{tabsError}</p>}

        {(isTabsLoading) &&
            <div className="flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-dashed rounded-full animate-spin"></div>
            </div>
        }

        {/* If tutorials data has loaded, display the tutorials */}
        {!isTabsLoading && !tabsError && tabs &&(
            tabs.length > 0 ? (
                <ul className="md:w-2/3 w-5/6">
                    {/* For each tutorial map tutorial details and embedded youtube video */}
                    {tabs.map((result, index) => (
                        <li key={index}>
                            <TabResult result={result} />
                        </li>
                    ))}
                </ul>
            ) : (
            tabs && <p className="text-white">No tabs found.</p>
            )
        )}

        <h1 className="text-2xl font-bold text-center">
            Video Tutorials
        </h1>

        <p className="text-muted italic mb-4 text-center text-gray-400">
            Please note tutorials returned may not always be accurate.
        </p>

        {tutorialsError && <p className="text-red-500 text-center">{tutorialsError}</p>}

        {(isTutorialsLoading) &&
            <div className="flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-dashed rounded-full animate-spin"></div>
            </div>
        }

        {/* If tutorials data has loaded, display the tutorials */}
        {!isTutorialsLoading && !tutorialsError && tutorials &&(
            tutorials.length > 0 ? (
                <div className="grid w-full 2xl:w-5/6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 p-4 gap-6">
                    {/* For each tutorial map tutorial details and embedded youtube video */}
                    {tutorials.map((video) => (
                        <TutorialCard key={video.id} video={video} />
                    ))}
                </div>
            ) : (
            tutorials && <p className="text-white">No video tutorials found.</p>
            )
        )}

    </div>
    );
}

export default Song

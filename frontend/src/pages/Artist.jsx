import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getArtistByID } from '../api';
import placeholderImage from '../assets/placeholder.jpg';

function Artist() {
    const { artistID } = useParams();
    const [artist, setArtist] = useState(null); // State to hold the artist details
    const [isLoading, setIsLoading] = useState(true); // State to indicate loading status regaring artist details
    const [error, setError] = useState(null); // State to hold errors regarding artist details
    const [artistImageUrl, setArtistImageUrl] = useState('');

    useEffect(() => {
        // Fetch artist details from Spotify API using the artistID from the URL
        async function fetchArtist() {
        try {
            const artistData = await getArtistByID(artistID);
            setArtist(artistData);
            setArtistImageUrl(artistData.images && artistData.images.length > 0 ? artistData.images[0].url : placeholderImage);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
        }

        fetchArtist();
    }, [artistID]);

    return (
    <div className="flex flex-col items-center 
    justify-center gap-8 mb-20
    text-white">
        {isLoading && 
            <div className="flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-dashed rounded-full animate-spin"></div>
            </div>
        }

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* If artist data is loaded, display the artist details */}
        {!isLoading && !error && artist && (
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

            <h1 className="text-2xl font-bold mb-4">
                Artist's Songs
            </h1>
        </>
        )}
    </div>
    );
}

export default Artist

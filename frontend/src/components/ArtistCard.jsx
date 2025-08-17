import { Link } from 'react-router-dom';
import placeholderImage from '../assets/placeholder.jpg';


function ArtistCard({ artist }) {

  // If no image placeholder
  const artistImageUrl =
    artist.images && artist.images.length > 0
      ? artist.images[0].url
      : placeholderImage;

  //Displays card of artist name and image
  return (
    <div className="flex flex-row items-center 
    p-5 mb-5 w-full
    bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
      <img
        src={artistImageUrl}
        alt={`${artist.name} profile`}
        className="w-16 h-16 rounded-full mr-4"
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Link
        to={`/artist/${artist.id}`}
        className="text-xl font-medium text-white max-w-sm
        hover:underline truncate"
        title={artist.name}
        >
          {artist.name}
        </Link>
      </div>
    </div>
  );
}

export default ArtistCard;

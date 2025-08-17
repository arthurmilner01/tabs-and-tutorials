import { Link } from "react-router-dom";
import albumPlaceholder from '../assets/albumplaceholder.png';

function SongCard({ song }) {
  // If no image placeholder
  const albumImageUrl =
    song.album.images && song.album.images.length > 0
      ? song.album.images[0].url
      : albumPlaceholder;

  // Displays card of song, artist and album cover
  return (
    <div className="flex flex-row items-center 
    p-5 mb-5 w-full
    bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
      <img
        src={albumImageUrl}
        alt={`${song.album.name}'s album cover`}
        className="w-16 h-16 mr-4"
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Link
        to={`/song/${encodeURIComponent(song.id)}`}
        className="text-lg font-medium 
        text-white hover:underline truncate"
        title={song.name}
        >
          {song.name}
        </Link>

        <Link
        to={`/artist/${encodeURIComponent(song.artists[0].id)}`}
        className="text-sm text-gray-400 mt-1 hover:underline truncate"
        title={song.artists[0].name}
        >
          {song.artists[0].name}
        </Link>
      </div>
    </div>
  );
}

export default SongCard;

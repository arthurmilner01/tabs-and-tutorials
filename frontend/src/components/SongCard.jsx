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
    p-4 mb-4 w-full max-w-lg min-w-lg
    bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
      <img
        src={albumImageUrl}
        alt={`${song.album.name}'s album cover`}
        className="w-16 h-16 mr-4"
      />

      <div className="flex flex-col">
        <a
        href={`http://localhost:3000/song/${encodeURIComponent(song.id)}`}
        rel="noreferrer"
        className="text-lg font-medium max-w-sm
        text-white hover:underline
        text-ellipsis overflow-hidden whitespace-nowrap"
        >
          {song.name}
        </a>
        <a
        href={`http://localhost:3000/artist/${encodeURIComponent(song.artists[0].id)}`}
        rel="noreferrer"
        className="text-sm text-gray-400 mt-1 max-w-sm
        text-ellipsis overflow-hidden whitespace-nowrap"
        >
          {song.artists[0].name}
        </a>
      </div>
    </div>
  );
}

export default SongCard;

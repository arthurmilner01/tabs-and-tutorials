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
    p-4 mb-4 w-full max-w-lg min-w-lg
    bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
      <img
        src={artistImageUrl}
        alt={`${artist.name} profile`}
        className="w-16 h-16 rounded-full mr-4"
      />

      <div className="flex flex-col">
        <a
        href={`http://localhost:5173/${encodeURIComponent(artist.name)}`}
        rel="noreferrer"
        className="text-lg font-medium text-white max-w-sm
        hover:underline text-ellipsis overflow-hidden whitespace-nowrap"
        >
          {artist.name}
        </a>
      </div>
    </div>
  );
}

export default ArtistCard;

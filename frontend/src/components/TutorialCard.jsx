function TutorialCard({ video }) {
    const { title, channelTitle } = video.snippet;
    const videoId = video.id;
    const stats = video.statistics || {};
    const viewCount = stats.viewCount || "0";
    const likeCount = stats.likeCount || "0";

    return (
        <div className="
        flex flex-col items-start p-5
        bg-white/10 backdrop-blur-sm
        border border-white/20 rounded-xl">
            <a 
            href={`https://www.youtube.com/embed/${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
            text-white font-semibold mb-2
            truncate w-full hover:underline
            "
            title={title}>
                {title}
            </a>

            <p className="
            text-gray-400 text-sm mb-2
            truncate w-full
            "
            title={channelTitle}>
                {channelTitle}
            </p>

            <p className="
            text-gray-300 text-sm mb-2
            truncate w-full
            ">
                {Number(likeCount).toLocaleString()} likes
                <br />
                {Number(viewCount).toLocaleString()} views
            </p>
            
            <div className="w-full aspect-video">
                <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-xl border border-purple-500"
                />
            </div>
        </div>
    );
}

export default TutorialCard;

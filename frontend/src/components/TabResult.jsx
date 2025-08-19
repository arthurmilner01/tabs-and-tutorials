import iconPlaceholder from '../assets/website-placeholder.png';

function TabResult({ result }) {

    const iconFromPagemap = result.pagemap?.cse_image?.[0]?.src;
    const iconFromMetatags = result.pagemap?.metatags?.[0]?.["og:image"];
    const favicon = result.pagemap?.metatags?.[0]?.["favicon"];
    // Displays card of tab search result
    // Using whatever icon is found, fallback if none found
    const icon = iconFromPagemap || iconFromMetatags || favicon || iconPlaceholder;

    return (
        <div className="flex flex-row items-center 
        p-5 mb-5 w-full
        bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
            <img
            src={icon}
            alt={`${result.displayLink} icon`}
            className="w-14 h-14 mr-4"
            />

            <div className="flex flex-col flex-1 min-w-0 gap-1">
                <a
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm md:text-lg font-medium 
                text-white hover:underline truncate"
                title={result.title}
                >
                    {result.title}
                </a>

                <p
                className="text-sm text-gray-400 truncate"
                title={result.snippet}
                >
                    {result.snippet}
                </p>

                <a
                href={`https://${result.displayLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:underline truncate"
                title={result.displayLink}
                >
                    {result.displayLink}
                </a>
            </div>
        </div>
    );
}

export default TabResult;

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from contextlib import asynccontextmanager
from utils.rate_limiter import SpotifyRateLimited, YoutubeRateLimited, GoogleSearchRateLimited
from utils.redis_cache import checkRedisCache
from utils.spotify_access_token import get_spotify_access_token
from database import Base, engine
from models import Songs

# Creating a single instance of httpx client
# More efficient than always creating a new instance
# And makes it easier to manage the closing of clients
@asynccontextmanager
async def Lifespan(app: FastAPI):
    # Global httpx instance with a timeout of 10 seconds
    app.httpxClient = httpx.AsyncClient(timeout=10)
    yield # Instance is created and usable
    await app.httpxClient.aclose() # Close the instance on app shutdown

app = FastAPI(lifespan=Lifespan)

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
GOOGLE_SEARCH_API_KEY = os.getenv("GOOGLE_SEARCH_API_KEY")
# Using a custom google search which filters by the following sites:
# Songsterr, Ultimate Guitar, GuitarTabs, AzChords
GOOGLE_CUSTOM_SEARCH_ID = os.getenv("GOOGLE_CUSTOM_SEARCH_ID")

# Allows CORS for the frontend (react) to communicate with the backend (FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Allows react to access the API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Creating the database tables
Base.metadata.create_all(bind=engine)

# Search for an artist using Spotify API
@app.get("/spotify/search_artists")
# Uses Spotify API so endpoint is rate limited
@SpotifyRateLimited
# Wrapper to check cache before adding to rate limiter or making API call
# Kwargs acting as a safety net for any additional arguments which will not be used in cache key
@checkRedisCache(
    lambda artist, **kwargs: f"spotify:search_artists:{artist.lower().strip()}", 
    expires=3600
)
async def search_for_artist(
    request: Request,
    artist: str = Query(..., description="Artist name to search with Spotify API.")
    ):
    client = request.app.httpxClient

    # Lower and strip to improve caching consistency
    artist = artist.lower().strip()
    # Calling function to get spotify access token for authorization
    access_token = await get_spotify_access_token(client)

    params = {
        "q": artist,
        "type": "artist",
        # Limit the number of results to 20
        "limit": 20
    }
    # Have to send auth header for API access with generated access token
    headers = {"Authorization": f"Bearer {access_token}"}

    # Making the API call to spotify
    response = await client.get("https://api.spotify.com/v1/search", params=params, headers=headers)
    # Check if the response is successful and send appropriate error if not
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching from Spotify API")

    return response.json()

# Search for a song using Spotify API
@app.get("/spotify/search_songs")
# Uses Spotify API so endpoint is rate limited
@SpotifyRateLimited
# Wrapper to check cache before adding to rate limiter or making API call
# Kwargs acting as a safety net for any additional arguments which will not be used in cache key
@checkRedisCache(
    lambda song, **kwargs: f"spotify:search_songs:{song.lower().strip()}", 
    expires=3600
)
async def search_for_songs(
    request: Request,
    song: str = Query(..., description="Song name to search with Spotify API.")
    ):
    client = request.app.httpxClient

    # Lower case and strip song name to improve cache hit rate
    song = song.lower().strip()
    
    # Calling function to get spotify access token for authorization
    access_token = await get_spotify_access_token(client)

    params = {
        "q": song,
        "type": "track",
        # Limit the number of results to 20
        "limit": 20
    }
    # Have to send auth header for API access with generated access token
    headers = {"Authorization": f"Bearer {access_token}"}

    # Making the API call to spotify
    response = await client.get("https://api.spotify.com/v1/search", params=params, headers=headers)
    # Check if the response is successful and send appropriate error if not
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching from Spotify API")

    return response.json()

# Get artist details by ID using Spotify API
@app.get("/spotify/artists/{artistID}")
# Uses Spotify API so endpoint is rate limited
@SpotifyRateLimited
# Wrapper to check cache before adding to rate limiter or making API call
# Kwargs acting as a safety net for any additional arguments which will not be used in cache key
@checkRedisCache(
    lambda artistID, **kwargs: f"spotify:artist_details:{artistID}", 
    expires=3600
)
async def get_artist_by_id(
    request: Request,
    artistID: str
    ):
    client = request.app.httpxClient

    # Calling function to get spotify access token for authorization
    access_token = await get_spotify_access_token(client)

    # Have to send auth header for API access with generated access token
    headers = {"Authorization": f"Bearer {access_token}"}

    # Making the API call to spotify
    response = await client.get(f"https://api.spotify.com/v1/artists/{artistID}", headers=headers)
    # Check if the response is successful and send appropriate error if not
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching artist details from Spotify API")

    return response.json()

# Get album details by ID using Spotify API
@app.get("/spotify/albums/{albumID}")
# Uses Spotify API so endpoint is rate limited
@SpotifyRateLimited
# Wrapper to check cache before adding to rate limiter or making API call
# Kwargs acting as a safety net for any additional arguments which will not be used in cache key
@checkRedisCache(
    lambda albumID, **kwargs: f"spotify:album_details:{albumID}", 
    expires=3600
)
async def get_album_by_id(
    request: Request,
    albumID: str
    ):
    client = request.app.httpxClient

    # Calling function to get spotify access token for authorization
    access_token = await get_spotify_access_token(client)

    # Have to send auth header for API access with generated access token
    headers = {"Authorization": f"Bearer {access_token}"}

    # Making the API call to spotify
    response = await client.get(f"https://api.spotify.com/v1/albums/{albumID}", headers=headers)
    # Check if the response is successful and send appropriate error if not
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching album details from Spotify API")

    return response.json()

# Get song details by ID using Spotify API
@app.get("/spotify/songs/{songID}")
# Uses Spotify API so endpoint is rate limited
@SpotifyRateLimited
# Wrapper to check cache before adding to rate limiter or making API call
# Kwargs acting as a safety net for any additional arguments which will not be used in cache key
@checkRedisCache(
    lambda songID, **kwargs: f"spotify:song_details:{songID}", 
    expires=3600
)
async def get_song_by_id(
    request: Request,
    songID: str
    ):
    client = request.app.httpxClient

    # Calling function to get spotify access token for authorization
    access_token = await get_spotify_access_token(client)

    # Have to send auth header for API access with generated access token
    headers = {"Authorization": f"Bearer {access_token}"}

    # Making the API call to spotify
    response = await client.get(f"https://api.spotify.com/v1/tracks/{songID}", headers=headers)
    # Check if the response is successful and send appropriate error if not
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching song details from Spotify API")

    return response.json()

# Get top songs of an artist by ID using Spotify API
@app.get("/spotify/artists/{artistID}/songs")
# Uses Spotify API so endpoint is rate limited
@SpotifyRateLimited
# Wrapper to check cache before adding to rate limiter or making API call
# Kwargs acting as a safety net for any additional arguments which will not be used in cache key
@checkRedisCache(
    lambda artistID, **kwargs: f"spotify:artist_top_songs:{artistID}", 
    expires=3600
)
async def get_artist_songs(
    request: Request,
    artistID: str):
    client = request.app.httpxClient

    # Calling function to get spotify access token for authorization
    access_token = await get_spotify_access_token(client)

    # Have to send auth header for API access with generated access token
    headers = {"Authorization": f"Bearer {access_token}"}

    # Making the API call to spotify
    response = await client.get(f"https://api.spotify.com/v1/artists/{artistID}/top-tracks?market=US", headers=headers)
    # Check if the response is successful and send appropriate error if not
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching from Spotify API")

    return response.json()

# Search for a song from a specific artist using Spotify API
@app.get("/spotify/artists/{artistName}/search_songs")
# Uses Spotify API so endpoint is rate limited
@SpotifyRateLimited
# Wrapper to check cache before adding to rate limiter or making API call
# Kwargs acting as a safety net for any additional arguments which will not be used in cache key
@checkRedisCache(
    lambda artistName, song, **kwargs: f"spotify:artist_search_songs:{artistName}:{song.lower().strip()}", 
    expires=3600
)
async def search_for_songs(
    request: Request,
    artistName: str,
    song: str = Query(..., description="Song name to search with Spotify API.")
):
    client = request.app.httpxClient
    
    # Lowercase and strip to improve effectiveness of caching
    # Not used on artist name because wont be input by user
    song = song.lower().strip()
    # Calling function to get spotify access token for authorization
    access_token = await get_spotify_access_token(client)

    # Searching with song name filtered by artist ID
    params = {
        "q": f"artist:{artistName} track:{song}",
        "type": "track",
        # Limit the number of results to 20
        "limit": 10
    }
    # Have to send auth header for API access with generated access token
    headers = {"Authorization": f"Bearer {access_token}"}

    # Making the API call to spotify
    response = await client.get("https://api.spotify.com/v1/search", params=params, headers=headers)
    # Check if the response is successful and send appropriate error if not
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching from Spotify API")
    
    return response.json()

@app.get("/youtube/get_video_tutorials/{search_query}")
@YoutubeRateLimited
@checkRedisCache(
        lambda search_query, **kwargs: f"youtube:get_video_tutorials:{search_query} Guitar Tutorial and Tabs",
        expires=86400 # Cache for whole day, youtube very limited on API calls
)
async def search_tutorial_videos(
        request: Request,
        search_query: str
):
    client = request.app.httpxClient

    # Adding Guitar Tutorial to the youtube search string
    # The original query will be the name of the song viewed by the user
    query = f"{search_query} Guitar Tutorial and Tabs"

    # Creating the URL to call the Youtube API
    # Searches the query and limits the results to 5
    search_url = (
        "https://www.googleapis.com/youtube/v3/search"
        f"?part=snippet"
        f"&q={query}"
        f"&type=video"
        f"&maxResults=8"
        f"&key={YOUTUBE_API_KEY}"
    )

    # Making the call to search Youtube via the API
    search_response = await client.get(search_url)

    # Check if the response is successful
    if search_response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching search details from YouTube API")
    
    # Get the video data returned
    search_data = search_response.json()

    # Extract the video IDs from the search data to get more specific
    # data (views, likes, etc.) about the video though another API call
    video_ids = []
    for video in search_data.get("items", []):
        video_ids.append(video["id"]["videoId"])

    if not video_ids:
        raise HTTPException(status_code=404, detail="No relevant videos were found on Youtube")
    
    # Get video IDs as a long string for insertion into API call URL
    video_ids_str = ",".join(video_ids)
    # Creating the URL to make the call which returns detailed video information
    videos_url = (
        "https://www.googleapis.com/youtube/v3/videos"
        f"?part=snippet,contentDetails,statistics"
        f"&id={video_ids_str}"
        f"&key={YOUTUBE_API_KEY}"
    )
    # Making the API call for video details
    response = await client.get(videos_url)
    # Check if response was successful
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching video details from YouTube API")
    
    return response.json()

# Get information from the search results from popular guitar tab websites
@app.get("/google/search_tabs/")
# Uses Google Custom Search API
@GoogleSearchRateLimited
# Wrapper to check cache before adding to rate limiter or making API call
# Kwargs acting as a safety net for any additional arguments which will not be used in cache key
@checkRedisCache(
    lambda query, **kwargs: f"google:search_tabs:{query} tab", 
    expires=3600
)
async def search_tab_websites(
    request: Request,
    query: str):
    client = request.app.httpxClient

    url = "https://www.googleapis.com/customsearch/v1/"
    params = {
        "q": f"{query} tab",
        "cx": f"{GOOGLE_CUSTOM_SEARCH_ID}",
        "key": f"{GOOGLE_SEARCH_API_KEY}"
    }

    # Making the API call to google search API
    response = await client.get(url, params=params)
    # Check if the response is successful and send appropriate error if not
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching search results")

    return response.json()




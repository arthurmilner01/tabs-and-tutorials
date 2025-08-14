from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
from contextlib import asynccontextmanager
from utils.rate_limiter import SpotifyRateLimited
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
        raise HTTPException(status_code=500, detail="Error fetching from Spotify API")

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
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.spotify.com/v1/search", params=params, headers=headers)
    # Check if the response is successful and send appropriate error if not
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching from Spotify API")
    
    return response.json()
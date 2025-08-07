from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import httpx
from database import Base, engine
from models import Songs

app = FastAPI()

# API key from envirnoment variable
LASTFM_API_KEY = os.getenv("LAST_FM_API_KEY")
# Storing as variable to use in the API calls
lastFMUrl = "http://ws.audioscrobbler.com/2.0/"

# Allows CORS for the frontend (react) to communicate with the backend (FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Allows react to access the API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Creating the database tables
Base.metadata.create_all(bind=engine)

# Search for an artist using Last.fm API
@app.get("/lastfm/search_artists")
async def search_for_artist(artist: str = Query(..., description="Artist name to search with Last.fm API.")):
    params = {
        "method": "artist.search",
        "artist": artist,
        "api_key": LASTFM_API_KEY,
        "format": "json",
        # Limit the number of results to 20
        "limit": 20
    }

    # Making the API call to Last.fm
    async with httpx.AsyncClient() as client:
        response = await client.get(lastFMUrl, params=params)

    # Check if the response is successful and send appropriate error if not
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching from Last.fm API")

    return response.json()

# Search for a song using Last.fm API
@app.get("/lastfm/search_songs")
async def search_for_song(song: str = Query(..., description="Song name to search with Last.fm API.")):
    params = {
        "method": "track.search",
        "track": song,
        "api_key": LASTFM_API_KEY,
        "format": "json",
        # Limit the number of results to 20
        "limit": 20
    }

    # Making the API call to Last.fm
    async with httpx.AsyncClient() as client:
        response = await client.get(lastFMUrl, params=params)

    # Check if the response is successful and send appropriate error if not
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching from Last.fm API")

    return response.json()
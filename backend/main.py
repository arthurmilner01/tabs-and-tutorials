from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import httpx
import base64
from database import Base, engine
from models import Songs


app = FastAPI()

# API key from envirnoment variable
SPOTIFY_CLIENT_KEY = os.getenv("SPOTIFY_CLIENT_KEY")
SPOTIFY_SECRET_KEY = os.getenv("SPOTIFY_SECRET_KEY")

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

# Gets access token to allow Spotify API calls
async def get_spotify_access_token():
    url = "https://accounts.spotify.com/api/token"
    # Sending authorization header with base64 encoded client key and secret
    auth_str = f"{SPOTIFY_CLIENT_KEY}:{SPOTIFY_SECRET_KEY}"
    headers = {
        "Authorization": "Basic " + base64.b64encode(auth_str.encode()).decode()
    }

    # Client credentials instead of user credentials as only need to access public data
    data = {"grant_type": "client_credentials"}

    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=data, headers=headers)
    
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching Spotify access token")

    return response.json()["access_token"]

# Search for an artist using Spotify API
@app.get("/spotify/search_artists")
async def search_for_artist(artist: str = Query(..., description="Artist name to search with Spotify API.")):
    # Calling function to get spotify access token for authorization
    access_token = await get_spotify_access_token()

    params = {
        "q": artist,
        "type": "artist",
        # Limit the number of results to 20
        "limit": 20
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

# Search for a song using Spotify API
@app.get("/spotify/search_songs")
async def search_for_songs(song: str = Query(..., description="Song name to search with Spotify API.")):
    # Calling function to get spotify access token for authorization
    access_token = await get_spotify_access_token()

    params = {
        "q": song,
        "type": "track",
        # Limit the number of results to 20
        "limit": 20
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

# Get artist details by ID using Spotify API
@app.get("/spotify/artists/{artistID}")
async def get_artist_by_id(artistID: str):
    # Calling function to get spotify access token for authorization
    access_token = await get_spotify_access_token()

    # Have to send auth header for API access with generated access token
    headers = {"Authorization": f"Bearer {access_token}"}

    # Making the API call to spotify
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://api.spotify.com/v1/artists/{artistID}", headers=headers)
    # Check if the response is successful and send appropriate error if not
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching from Spotify API")

    return response.json()
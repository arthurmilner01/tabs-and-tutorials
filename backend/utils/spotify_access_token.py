from fastapi import HTTPException
from utils.redis_cache import checkRedisCacheStringKey
import base64
import os
import httpx

# API key from envirnoment variable
SPOTIFY_CLIENT_KEY = os.getenv("SPOTIFY_CLIENT_KEY")
SPOTIFY_SECRET_KEY = os.getenv("SPOTIFY_SECRET_KEY")

# Gets access token to allow Spotify API calls
# Global httpx instance is passed as a parameter
# Caching key with expiration of under an hour to prevent
# unecessary access token requests
@checkRedisCacheStringKey("spotify:access_token", 3400)
async def get_spotify_access_token(client: httpx.AsyncClient):
    url = "https://accounts.spotify.com/api/token"
    # Sending authorization header with base64 encoded client key and secret
    auth_str = f"{SPOTIFY_CLIENT_KEY}:{SPOTIFY_SECRET_KEY}"
    headers = {
        "Authorization": "Basic " + base64.b64encode(auth_str.encode()).decode()
    }

    # Client credentials instead of user credentials as only need to access public data
    data = {"grant_type": "client_credentials"}

    response = await client.post(url, data=data, headers=headers)
    
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching Spotify access token")

    return response.json()["access_token"]
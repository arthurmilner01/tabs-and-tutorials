# Class for rate limiting API calls
import asyncio
import time
from functools import wraps
from collections import deque

class RateLimiter:
    def __init__(self, maxCalls=10, period=1.0):
        self.maxCalls = maxCalls  # Maximum number of calls allowed in the period
        self.period = period # Time period for tracking the max calls
        self.lock = asyncio.Lock() # Lock to ensure rate limiter is accessed by one coroutine at a time
        # Allows efficient appending and popping of call times compared to a list
        self.calls = deque()

    async def acquire(self):
        # Using lock to ensure it is only accessed by one coroutine at a time
        async with self.lock:
            # Get the current time
            now = time.monotonic()

            # Remove calls older than the current second
            while self.calls and self.calls[0] <= now - self.period:
                self.calls.popleft()
            
            # If more than the max number of calls in current second
            if len(self.calls) >= self.maxCalls:
                # Wait until the oldest call is outside the period
                # Since this means a new call can be made after sleep time passes
                sleepTime = self.calls[0] + self.period - now
                await asyncio.sleep(sleepTime)
                # Get new current time after sleep time
                now = time.monotonic()
            
            # Append the current call time to the list either immediately or after sleep time
            self.calls.append(time.monotonic())

# Making instance of RateLimiter to be used across all spotify endpoints
spotifyRateLimiter = RateLimiter(8, 1.0)  # 8 calls per second

# Rate limiting decorator function to limit the number of API calls per second
# Will track API calls across all endpoints
# Runs before the actual endpoint function
def SpotifyRateLimited(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Call the acquire method of RateLimiter
        await spotifyRateLimiter.acquire()
        return await func(*args, **kwargs)
    return wrapper
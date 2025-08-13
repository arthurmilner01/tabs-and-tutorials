import redis.asyncio as redis
import os

# URL for the Redis database
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
# Initialize Redis client
redisClient = redis.from_url(REDIS_URL, decode_responses=True)
from redis_client import redisClient
from functools import wraps
import json

# Wrapper function which checks if result is cached in Redis
# If result is cached prevents API call and returns cached result
# Wrapper should be placed before any rate limiting if needed
def checkRedisCache(cacheKeyFunc, expires: int = 3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Need to use function to get cache key dynamically
            cacheKey = cacheKeyFunc(*args, **kwargs)
            # Check if the result is already cached in Redis
            cachedResult = await redisClient.get(cacheKey)
            if cachedResult:
                data = json.loads(cachedResult)
                # Simply marking if the result is from cache
                data["source"] = "cache"
                return data
            
            # If not cached, call the original function
            result = await func(*args, **kwargs)
            # Cache the result in Redis to reduce future API calls
            await redisClient.setex(cacheKey, expires, json.dumps(result))
            return result
        return wrapper
    return decorator
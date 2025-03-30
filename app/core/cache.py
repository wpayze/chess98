from aiocache import caches

def setup_cache():
    caches.set_config({
        "default": {
            "cache": "aiocache.SimpleMemoryCache",
            "ttl": 0, 
            "serializer": {
                "class": "aiocache.serializers.JsonSerializer"
            }
        }
    })

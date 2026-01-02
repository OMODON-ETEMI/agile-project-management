# package/redis_client.py
import redis
import os
import json

# Pull host/port from environment (set in docker-compose or .env)
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

# Initialize Redis client
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

def publish_event(channel: str, data: dict):
    """Publish a JSON-serializable event to Redis"""
    redis_client.publish(channel, json.dumps(data))

import os
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000 per day", "250 per hour"],
    storage_uri=f"redis://{os.getenv('REDIS_HOST', 'redis')}:{os.getenv('REDIS_PORT', 6379)}"
)
from functools import wraps
from flask import request, current_app
from datetime import datetime, timezone, timedelta
from pymongo import ASCENDING
from pymongo.errors import PyMongoError
from package import db

class AuthManager:
    """Manages authentication security, failed login attempts, and token blocking."""
    
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_MINUTES = 15
    TOKEN_EXPIRY_DAYS = 1

    class FailedLogin:
        """Handles failed login attempt records."""
        def __init__(self, username: str, ip_address: str):
            self.username = username
            self.ip_address = ip_address
            self.timestamp = datetime.now(timezone.utc)

        def create(self) -> bool:
            """Create a new failed login record."""
            try:
                db.FailedLogins.insert_one({
                    'username': self.username,
                    'ip_address': self.ip_address,
                    'timestamp': self.timestamp
                })
                return True
            except PyMongoError as e:
                current_app.logger.error(f"Failed to record login attempt: {str(e)}")
                return False

    class BlockedToken:
        """Handles blocked token records."""
        def __init__(self, token: str):
            self.token = token
            self.created_at = datetime.now(timezone.utc)

        def create(self) -> bool:
            """Create a new blocked token record."""
            try:
                db.BlockedTokens.insert_one({
                    'token': self.token,
                    'created_at': self.created_at
                })
                return True
            except PyMongoError as e:
                current_app.logger.error(f"Failed to block token: {str(e)}")
                return False

        @staticmethod
        def is_blocked(token: str) -> bool:
            """Check if a token is blocked."""
            try:
                return db.BlockedTokens.find_one({'token': token}) is not None
            except PyMongoError as e:
                current_app.logger.error(f"Failed to check blocked token: {str(e)}")
                return True  # Fail secure - assume token is blocked if we can't check

    @classmethod
    def initialize_db(cls) -> bool:
        """Initialize database indexes for security collections."""
        try:
            # Failed Logins indexes
            db.FailedLogins.create_index([("username", ASCENDING)])
            db.FailedLogins.create_index([("ip_address", ASCENDING)])
            db.FailedLogins.create_index([
                ("username", ASCENDING),
                ("timestamp", ASCENDING)
            ])
            db.FailedLogins.create_index([
                ("ip_address", ASCENDING),
                ("timestamp", ASCENDING)
            ])
            
            # Blocked Tokens indexes
            db.BlockedTokens.create_index(
                [("token", ASCENDING)], 
                unique=True
            )
            db.BlockedTokens.create_index(
                [("created_at", ASCENDING)],
                expireAfterSeconds=cls.TOKEN_EXPIRY_DAYS * 86400
            )
            
            return True
        except PyMongoError as e:
            current_app.logger.error(f"Failed to initialize database indexes: {str(e)}")
            return False

    @classmethod
    def check_brute_force(cls, username: str, ip_address: str) -> bool:
        """
        Check if too many failed login attempts have occurred.
        Returns True if attempts exceed maximum allowed.
        """
        try:
            cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=cls.LOCKOUT_MINUTES)
            failed_attempts = db.FailedLogins.count_documents({
                "$or": [
                    {"username": username},
                    {"ip_address": ip_address}
                ],
                "timestamp": {"$gte": cutoff_time}
            })
            return failed_attempts >= cls.MAX_LOGIN_ATTEMPTS
        except PyMongoError as e:
            current_app.logger.error(f"Failed to check brute force attempts: {str(e)}")
            return True  # Fail secure - assume too many attempts if we can't check

    @classmethod
    def record_failed_attempt(cls, username: str, ip_address: str) -> bool:
        """Record a failed login attempt."""
        try:
            failed_login = cls.FailedLogin(username, ip_address)
            return failed_login.create()
        except Exception as e:
            current_app.logger.error(f"Failed to record failed attempt: {str(e)}")
            return False

    @classmethod
    def clear_failed_attempts(cls, username: str) -> bool:
        """Clear all failed attempts for a username."""
        try:
            db.FailedLogins.delete_many({"username": username})
            return True
        except PyMongoError as e:
            current_app.logger.error(f"Failed to clear failed attempts: {str(e)}")
            return False

    @classmethod
    def block_token(cls, token: str) -> bool:
        """Block a refresh token."""
        try:
            blocked_token = cls.BlockedToken(token)
            return blocked_token.create()
        except Exception as e:
            current_app.logger.error(f"Failed to block token: {str(e)}")
            return False
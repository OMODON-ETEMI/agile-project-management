from pymongo import ASCENDING, DESCENDING, TEXT
import logging

def initialize_all_indexes(db):
    """
    Initializes indexes for the application based on models:
    User, Board, Workspace, and Issues.
    """
    try:
        # --- Users Collection ---
        # Unique constraints for authentication, run in background to prevent blocking
        db.Users.create_index([("username", ASCENDING)], unique=True, background=True)
        db.Users.create_index([("email", ASCENDING)], unique=True, background=True)

        # --- Workspace Collection ---
        # Slugs must be unique for URL routing, run in background
        db.Workspace.create_index([("slug", ASCENDING)], unique=True, background=True)
        db.Workspace.create_index([("organisation_id", ASCENDING)], background=True)
        db.Workspace.create_index([("created_By", ASCENDING)], background=True)
        # Text search for workspace discovery, run in background
        db.Workspace.create_index([("title", TEXT), ("description", TEXT)], background=True)

        # --- Board Collection ---
        # Boards are frequently filtered by workspace and ownership, run in background
        db.Board.create_index([("workspace", ASCENDING)], background=True)
        db.Board.create_index([("user_id", ASCENDING)], background=True)
        db.Board.create_index([("title", ASCENDING)], background=True)

        # --- Issues Collection (derived from issue.js) ---
        # Custom Issue ID must be unique, run in background
        db.Issues.create_index([("issueID", ASCENDING)], unique=True, background=True)
        # Relationship lookups, run in background
        db.Issues.create_index([("board_id", ASCENDING)], background=True)
        db.Issues.create_index([("workspace_id", ASCENDING)], background=True)
        db.Issues.create_index([("reporter", ASCENDING)], background=True)
        db.Issues.create_index([("assignees", ASCENDING)], background=True)
        # Filtering and Sorting, run in background
        db.Issues.create_index([("status", ASCENDING)], background=True)
        db.Issues.create_index([("issuetype", ASCENDING)], background=True)
        db.Issues.create_index([("priority", ASCENDING)], background=True)
        db.Issues.create_index([("position", ASCENDING)], background=True)
        db.Issues.create_index([("createdAt", DESCENDING)], background=True)
        # Multi-key index for labels, run in background
        db.Issues.create_index([("labels", ASCENDING)], background=True)
        # Full-text search for the issue navigator, run in background
        db.Issues.create_index([("title", TEXT), ("description", TEXT)], background=True)

        # --- Relationship Collections ---
        # Ensure a user isn't added to the same org/workspace twice, run in background
        db.User_Organisation.create_index(
            [("user_id", ASCENDING), ("organisation_id", ASCENDING)], unique=True, background=True
        )
        db.User_Workspace.create_index(
            [("user_id", ASCENDING), ("workspace_id", ASCENDING)], unique=True, background=True
        )

        logging.info("Database indexes initialized successfully.")
    except Exception as e:
        logging.error(f"Error initializing indexes: {str(e)}")

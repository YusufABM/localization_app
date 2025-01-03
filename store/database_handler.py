import sqlite3
import os
from datetime import datetime

class DatabaseHandler:
    def __init__(self, db_name="mmWave_latency.db"):
        self.db_name = db_name
        self._ensure_db_exists()

    def _ensure_db_exists(self):
        """Ensures the database and required tables are created."""
        if not os.path.exists(self.db_name):
            self._initialize_database()

    def _initialize_database(self):
        """Initializes the database with required tables."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS time_differences (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    room TEXT NOT NULL,
                    time_difference_ms INTEGER NOT NULL,
                    source TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
        conn.commit()

    def _get_connection(self):
        """Creates and returns a new database connection."""
        return sqlite3.connect(self.db_name)

    def insert_time_difference(self, room, time_difference_ms, source):
        """Inserts time difference data into the database."""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO time_differences (room, time_difference_ms, source, timestamp)
                VALUES (?, ?, ?, ?)
            """, (room, time_difference_ms, source, timestamp))
            conn.commit()

    def fetch_all_time_differences(self):
        """Fetches all time difference data from the database."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM time_differences")
            rows = cursor.fetchall()
            return [
                {"id": row[0], "room": row[1], "time_difference_ms": row[2], "timestamp": row[3]}
                for row in rows
            ]
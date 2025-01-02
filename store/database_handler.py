import sqlite3
import os
from datetime import datetime

class DatabaseHandler:
  def __init__(self, db_name="localization_data.db"):
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
        CREATE TABLE IF NOT EXISTS localization_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          source TEXT NOT NULL,
          room TEXT NOT NULL,
          x REAL NOT NULL,
          y REAL NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      """)
      conn.commit()

  def _get_connection(self):
    """Creates and returns a new database connection."""
    return sqlite3.connect(self.db_name)

  def insert_localization_data(self, source, room, x, y, timestamp=None):
    """Inserts localization data into the database."""
    if timestamp is None:
      timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    with self._get_connection() as conn:
      cursor = conn.cursor()
      cursor.execute("""
        INSERT INTO localization_data (source, room, x, y, timestamp)
        VALUES (?, ?, ?, ?, ?)
      """, (source, room, x, y, timestamp))
      conn.commit()

  def fetch_all_data(self):
    """Fetches all data from the localization_data table."""
    with self._get_connection() as conn:
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM localization_data")
      rows = cursor.fetchall()
      return [
        {"id": row[0], "source": row[1], "room": row[2], "x": row[3], "y": row[4], "timestamp": row[5]}
        for row in rows
      ]

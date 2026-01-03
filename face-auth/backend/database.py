import os
from pymongo import MongoClient
from dotenv import load_dotenv
from constants import DB_NAME
import sys

load_dotenv()

class DatabaseConnection:
    def __init__(self):
        self.uri = os.getenv("MONGODB_URI")
        self.client = None
        self.db = None
        
    def connect(self):
        try:
            print("🔗 Connecting to MongoDB...")
            self.client = MongoClient(f"{self.uri}/{DB_NAME}")
            self.db = self.client[DB_NAME]
            self.client.admin.command('ping')
            print(f"✅ MongoDB connected !! DB HOST: {self.client.HOST}")
            return True
        except Exception as e:
            print("❌ MONGODB connection FAILED", e)
            sys.exit(1)
    
    def get_database(self):
        if self.db is None:
            self.connect()
        return self.db
    
    def get_collection(self, collection_name):
        db = self.get_database()
        return db[collection_name]
    
    def close(self):
        if self.client:
            self.client.close()
            print("🔒 MongoDB connection closed")

db_connection = DatabaseConnection()

from pymongo import MongoClient
import certifi
import os
from dotenv import load_dotenv

uri = os.getenv("mongo_uri")

client = MongoClient(uri,tlsCAFile = certifi.where())

# try:
#     print(client.admin.command("ping"))
#     print("✅ Connected to MongoDB!")
# except Exception as e:
#     print("❌ Failed to connect:", e)

try:
    database = client.get_database("sample_mflix")
    movies = database.get_collection("movies")
    # Query for a movie that has the title 'Back to the Future'
    query = { "runtime": 14 }
    movie = movies.find_one(query)
    print(movie)
    client.close()
except Exception as e:
    raise Exception("Unable to find the document due to the following error: ", e)


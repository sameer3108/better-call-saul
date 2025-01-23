from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv, find_dotenv
import os
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load API variables
load_dotenv(find_dotenv())

# Flask app setup
app = Flask(__name__)

# Configuring CORS to allow connections only from React dev server
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Loading API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # Securely load the API key
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in the environment variables.")

# Configure Gemini API client
genai.configure(api_key=GEMINI_API_KEY)

@app.route("/api/legal-query", methods=["POST"])
def legal_query():
    logger.debug("Received a POST request at /api/legal-query")

    # Parse request data
    data = request.get_json()
    logger.debug(f"Request data: {data}")

    location = data.get("location")
    query = data.get("query")

    if not location or not query:
        logger.error("Location or query missing in the request.")
        return jsonify({"error": "Location and query are required."}), 400

    # Create prompt for Gemini API
    prompt_text = f"Provide legal guidance based on the following location ({location}) and query: {query}"
    logger.debug(f"Generated prompt: {prompt_text}")

    try:
        # Call the Gemini API using the official client
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt_text)
        logger.debug(f"Response from Gemini API: {response}")

        # Extract answer from the response
        if response.candidates and len(response.candidates) > 0:
            answer = response.candidates[0].content.parts[0].text
        else:
            answer = "No response available."

        return jsonify({"answer": answer})

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/", methods=["GET"])
def home():
    return "Flask server is running!"


if __name__ == "__main__":
    app.run(debug=True)

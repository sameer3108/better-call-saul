from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv, find_dotenv
import os
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv(find_dotenv())

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": ["https://bettercallai.netlify.app"]}})
# CORS(app, resources={r"/*": {"origins": ["*"]}})

# Loading API key and final prompt from .env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
FINAL_PROMPT = os.getenv("FINAL_PROMPT")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in the environment variables.")

if not FINAL_PROMPT:
    raise ValueError("FINAL_PROMPT is not set in the environment variables.")

genai.configure(api_key=GEMINI_API_KEY)

@app.route("/api/legal-query", methods=["POST"])
def legal_query():
    logger.debug("Received a POST request at /api/legal-query")

    data = request.get_json()
    logger.debug(f"Request data: {data}")

    location = data.get("location")
    query = data.get("query")

    if not location or not query:
        logger.error("Location or query missing in the request.")
        return jsonify({"error": "Location and query are required."}), 400

    # Format the final prompt with location and query
    formatted_prompt = FINAL_PROMPT.format(location=location, query=query)
    logger.debug(f"Formatted prompt: {formatted_prompt}")  # Log the formatted prompt

    try:
        # Calling Gemini API
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(formatted_prompt)
        logger.debug(f"Response from Gemini API: {response}")  # Log the raw response

        # Extract answer from the response
        if response.candidates and len(response.candidates) > 0:
            answer = response.candidates[0].content.parts[0].text
        else:
            answer = "No response available."

        # Process answer into sections
        processed_answer = answer.replace("\n", "<br>")
        return jsonify({"answer": processed_answer})

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/", methods=["GET"])
def home():
    return "Flask server is running!"


if __name__ == "__main__":
    app.run(debug=True)
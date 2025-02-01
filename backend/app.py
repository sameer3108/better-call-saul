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


# Loading API key 
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in the environment variables.")

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

    # Create system-level prompt for rules
    # user_prompt = f"Provide legal guidance based on the following location ({location}) and query: {query}"
    # final_prompt = system_prompt + "\n\n" + user_prompt

    final_prompt = f"""
        You are a professional lawyer providing detailed, accurate, and formal legal advice. 
        Format the response in a short, clear and concise manner with sections like Key Points, 
        Immediate Actions, and Next Steps. Use professional tone and avoid informal language.
        Format it in user friendly way and as a professional lawyer do your best in helping the query below. 

        Respond as follows:
            1. Start with a brief easy to understand summary (dont say **Summary:**) just have a summary with simple words here.
            2. Provide actionable steps under proper headings.
            3. Avoid cluttering the text with too many symbols like "**".
            4. Explain complex words used.
            5. You can say no when something is not possible
            6. If something is not related to legal query, simply end response at summary section.

        Location: {location}
        Query: {query}

        Please provide legal guidance tailored to the location and query above.
    """

    try:
        # Calling Gemini API
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(final_prompt)
        logger.debug(f"Response from Gemini API: {response}")

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

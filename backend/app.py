from flask import Flask, request, jsonify
import openai

app = Flask(__name__)

# Configure OpenAI API
openai.api_key = "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"

@app.route("/api/legal-query", methods=["POST"])
def legal_query():
    data = request.get_json()
    location = data.get("location")
    query = data.get("query")

    if not location or not query:
        return jsonify({"error": "Location and query are required."}), 400

    # Combine location and query for context
    prompt = f"Provide legal guidance based on the following location ({location}) and query: {query}"

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a legal assistant."},
                {"role": "user", "content": prompt},
            ],
        )
        answer = response["choices"][0]["message"]["content"].strip()
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
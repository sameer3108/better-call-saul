import React, { useState } from "react";
import "./App.css"; 

const App = () => {
  const [location, setLocation] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResponse("");

    try {
      const res = await fetch("https://bettercallai-backend.onrender.com/api/legal-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: location,
          query: query,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data.answer);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to fetch response");
      }
    } catch (err) {
      setError("An error occurred while connecting to the server");
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">AI Legal Assistant</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="input-group">
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Query</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Get Advice
        </button>
      </form>

      {response && (
        <div className="response-container">
          <h3>Response:</h3>
          <div
            className="response-content"
            dangerouslySetInnerHTML={{ __html: response }} // Render HTML from the backend
          />
        </div>
      )}

      {error && (
        <div className="error-container">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default App;

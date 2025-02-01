import React, { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import "./App.css";

const App = () => {
  const [location, setLocation] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResponse("");
    setLoading(true);

    try {
      const res = await fetch("https://better-call-saul.onrender.com/api/legal-query", {
      // const res = await fetch("http://127.0.0.1:5000/api/legal-query", {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">AI Legal Assistant</h1>
      <p className="subtitle">Get professional legal advice tailored to your location and query.</p>
      <form onSubmit={handleSubmit} className="form">
        <div className="input-group">
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location (e.g., California, USA)"
            required
          />
        </div>
        <div className="input-group">
          <label>Query</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your legal query"
            required
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Fetching Advice..." : "Get Advice"}
        </button>
      </form>

      {loading && (
        <div className="spinner-container">
          <ClipLoader size={50} color={"#007bff"} loading={loading} />
          <p>Fetching advice, please wait...</p>
        </div>
      )}

      {!loading && response && (
        <div className="response-container">
          <h3>Response:</h3>
          <div
            className="response-content"
            dangerouslySetInnerHTML={{ __html: response }}
          />
        </div>
      )}

      {!loading && error && (
        <div className="error-container">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default App;
import React, { useState } from "react";
import './App.css';

function App() {
  const [location, setLocation] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/legal-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, query }),
    });
    const data = await res.json();
    setResponse(data.answer);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Better Call Saul - Your AI Legal Assistant</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Location: </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your city or region"
          />
        </div>
        <div>
          <label>Your Question: </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your legal issue"
          />
        </div>
        <button type="submit">Get Advice</button>
      </form>
      {response && (
        <div>
          <h2>Legal Advice:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;